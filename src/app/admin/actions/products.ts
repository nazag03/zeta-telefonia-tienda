"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, newId, write, type Op, type ProductImage, type ProductVariant, type UpdateInput } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify, type Spec } from "@/lib/format";
import { bool, parseMoney, safeJson, str, zodErrors, type ActionState } from "@/lib/form";
import { UploadError, deleteImage, filesFrom, saveImage } from "@/lib/upload";

const money = z.number({ error: "Ingresá un precio válido." }).positive("El precio debe ser mayor a 0.").max(1e10);


const moneyField = (fd: FormData, name: string) => {
  const raw = str(fd, name);
  return raw ? (parseMoney(raw) ?? NaN) : null;
};

const productSchema = z
  .object({
    name: z.string().min(2, "Ingresá el nombre.").max(140),
    slug: z.string().max(90),
    brand: z.string().min(1, "Ingresá la marca.").max(60),
    model: z.string().max(80),
    shortDescription: z.string().max(280),
    description: z.string().max(8000),
    
    price: money.nullable(),
    promoPrice: z.number({ error: "Ingresá un precio válido." }).positive("El precio debe ser mayor a 0.").max(1e10).nullable(),
    priceUsd: money.nullable(),
    promoPriceUsd: z.number({ error: "Ingresá un precio válido." }).positive("El precio debe ser mayor a 0.").max(1e10).nullable(),
    currency: z.enum(["ARS", "USD"]),
    availability: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ON_ORDER"]),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]),
    categoryId: z.string().max(40).nullable(),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
    isOffer: z.boolean(),
    active: z.boolean(),
    order: z.number().int().min(-9999).max(9999),
  })
  .superRefine((d, ctx) => {
    for (const [price, promo] of [["price", "promoPrice"], ["priceUsd", "promoPriceUsd"]] as const) {
      if (d[promo] == null) continue;
      if (d[price] == null) ctx.addIssue({ code: "custom", path: [promo], message: "Para cargar un precio promocional, primero cargá el precio normal." });
      else if (d[promo]! >= d[price]!) ctx.addIssue({ code: "custom", path: [promo], message: "El precio promocional debe ser menor al precio normal." });
    }
  });

const AVAILABILITIES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ON_ORDER"];


type VariantInput = {
  id?: string;
  name?: string;
  hex?: string | null;
  imageKeys?: string[];
  ownPrice?: boolean;
  price?: string;
  promoPrice?: string;
  priceUsd?: string;
  promoPriceUsd?: string;
  availability?: string | null;
};


function parseVariants(raw: VariantInput[], imageId: (key: string) => string | null): { variants: ProductVariant[] } | { error: string } {
  if (!Array.isArray(raw)) return { variants: [] };
  const variants: ProductVariant[] = [];
  const names = new Set<string>();
  for (const v of raw.slice(0, 30)) {
    if (!v || typeof v !== "object") continue;
    const name = String(v.name ?? "").trim().slice(0, 60);
    if (!name) return { error: "Hay un color sin nombre. Escribile el nombre o quitalo." };
    const key = name.toLowerCase();
    if (names.has(key)) return { error: `El color "${name}" está repetido.` };
    names.add(key);

    const amount = (x: unknown) => {
      const t = String(x ?? "").trim();
      if (!t) return null;
      const n = parseMoney(t);
      return n != null && n > 0 && n <= 1e10 ? n : NaN;
    };
    const ownPrice = !!v.ownPrice;
    const prices = { price: amount(v.price), promoPrice: amount(v.promoPrice), priceUsd: amount(v.priceUsd), promoPriceUsd: amount(v.promoPriceUsd) };
    if (ownPrice) {
      if (Object.values(prices).some((n) => Number.isNaN(n))) return { error: `Revisá los precios del color "${name}".` };
      for (const [pk, rk] of [["price", "promoPrice"], ["priceUsd", "promoPriceUsd"]] as const) {
        if (prices[rk] == null) continue;
        if (prices[pk] == null) return { error: `Color "${name}": para cargar un precio promocional, primero cargá el precio normal.` };
        if (prices[rk]! >= prices[pk]!) return { error: `Color "${name}": el precio promocional debe ser menor al precio normal.` };
      }
    }
    const hex = typeof v.hex === "string" && /^#[0-9a-f]{6}$/i.test(v.hex) ? v.hex.toLowerCase() : null;
    const availability = v.availability && AVAILABILITIES.includes(v.availability) ? v.availability : null;
    const imageIds = [...new Set((Array.isArray(v.imageKeys) ? v.imageKeys : []).map((k) => imageId(String(k))).filter((x): x is string => !!x))];
    variants.push({
      id: typeof v.id === "string" && /^[A-Za-z0-9]{1,40}$/.test(v.id) ? v.id : newId(),
      name,
      hex,
      imageIds,
      ownPrice,
      ...(ownPrice ? (prices as { price: number | null; promoPrice: number | null; priceUsd: number | null; promoPriceUsd: number | null }) : { price: null, promoPrice: null, priceUsd: null, promoPriceUsd: null }),
      availability,
    });
  }
  return { variants };
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "producto";
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await db.products.find((p) => p.slug === slug);
    if (!hit || hit.id === excludeId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function saveProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = str(fd, "id") || undefined;

  const parsed = productSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    brand: str(fd, "brand"),
    model: str(fd, "model"),
    shortDescription: str(fd, "shortDescription"),
    description: str(fd, "description"),
    price: moneyField(fd, "price"),
    promoPrice: moneyField(fd, "promoPrice"),
    priceUsd: moneyField(fd, "priceUsd"),
    promoPriceUsd: moneyField(fd, "promoPriceUsd"),
    currency: str(fd, "currency") || "ARS",
    availability: str(fd, "availability") || "IN_STOCK",
    condition: str(fd, "condition") || "NEW",
    categoryId: str(fd, "categoryId") || null,
    isFeatured: bool(fd, "isFeatured"),
    isNew: bool(fd, "isNew"),
    isOffer: bool(fd, "isOffer"),
    active: bool(fd, "active"),
    order: Number(str(fd, "order") || 0) || 0,
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const specs = safeJson<Spec[]>(str(fd, "specs"), [])
    .filter((s) => s && typeof s.label === "string" && typeof s.value === "string" && s.label.trim() && s.value.trim())
    .slice(0, 40)
    .map((s) => ({ label: s.label.trim().slice(0, 60), value: s.value.trim().slice(0, 200) }));

  
  const kept = safeJson<{ id: string; alt?: string }[]>(str(fd, "keptImages"), []).filter((k) => typeof k.id === "string");
  const newFiles = filesFrom(fd, "newImages");
  if (kept.length + newFiles.length > 12) return { error: "Máximo 12 fotos por producto." };
  
  const newKeys = safeJson<string[]>(str(fd, "newImageKeys"), []);
  const rawVariants = safeJson<VariantInput[]>(str(fd, "variants"), []);
  
  const precheck = parseVariants(rawVariants, (k) => k);
  if ("error" in precheck) return { error: precheck.error };

  if (d.categoryId && !(await db.categories.get(d.categoryId))) {
    return { fieldErrors: { categoryId: "Categoría inválida." }, error: "Revisá los campos marcados." };
  }

  let uploaded: string[] = [];
  try {
    for (const f of newFiles) uploaded.push(await saveImage(f, { folder: "productos" }));
  } catch (e) {
    await Promise.all(uploaded.map(deleteImage));
    return { error: e instanceof UploadError ? e.message : "No se pudieron procesar las imágenes." };
  }

  const slug = await uniqueSlug(d.slug || d.name, id);
  const data = {
    ...d,
    slug,
    model: d.model || null,
    shortDescription: d.shortDescription || null,
    description: d.description || null,
    specs: JSON.stringify(specs),
  };

  let removed: string[] = [];
  try {
    
    const added: Omit<ProductImage, "order">[] = uploaded.map((url) => ({ id: newId(), url, alt: d.name }));
    const newIdByKey = new Map(added.map((img, i) => [String(newKeys[i] ?? ""), img.id]));
    if (id) {
      const existing = await db.products.get(id);
      if (!existing) throw new Error("NOT_FOUND");
      const current = new Map((existing.images ?? []).map((img) => [img.id, img]));
      const keptImgs = kept.flatMap((k) => {
        const img = current.get(k.id);
        return img ? [{ ...img, alt: k.alt?.slice(0, 140) || null }] : [];
      });
      const keepIds = new Set(keptImgs.map((i) => i.id));
      removed = (existing.images ?? []).filter((img) => !keepIds.has(img.id)).map((i) => i.url);
      const images = [...keptImgs, ...added].map((img, order) => ({ ...img, order }));
      const parsedV = parseVariants(rawVariants, (k) => newIdByKey.get(k) ?? (keepIds.has(k) ? k : null));
      const variants = "variants" in parsedV ? parsedV.variants : [];
      await db.products.update(id, { ...data, images, variants });
    } else {
      const parsedV = parseVariants(rawVariants, (k) => newIdByKey.get(k) ?? null);
      const variants = "variants" in parsedV ? parsedV.variants : [];
      await db.products.create({ ...data, images: added.map((img, order) => ({ ...img, order })), variants });
    }
  } catch (e) {
    await Promise.all(uploaded.map(deleteImage));
    if (e instanceof Error && e.message === "NOT_FOUND") return { error: "El producto ya no existe." };
    console.error(e);
    return { error: "No se pudo guardar el producto. Intentá de nuevo." };
  }
  await Promise.all(removed.map(deleteImage));
  uploaded = [];

  revalidateSite();
  redirect(`/admin/productos?ok=${id ? "actualizado" : "creado"}`);
}

export async function deleteProductAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const p = await db.products.get(id);
  if (!p) return;
  
  const promos = await db.promotions.where((pr) => (pr.productIds ?? []).includes(id));
  await write([
    { op: "delete", col: "products", id },
    ...promos.map((pr): Op => ({ op: "update", col: "promotions", id: pr.id, data: { productIds: pr.productIds.filter((x) => x !== id) } })),
  ]);
  await Promise.all((p.images ?? []).map((i) => deleteImage(i.url)));
  revalidateSite();
  redirect("/admin/productos?ok=eliminado");
}

export async function duplicateProductAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const p = await db.products.get(id);
  if (!p) return;
  const { id: _id, createdAt: _c, updatedAt: _u, images: _i, ...rest } = p;
  
  const copy = await db.products.create({
    ...rest,
    images: [],
    
    variants: (p.variants ?? []).map((v) => ({ ...v, id: newId(), imageIds: [] })),
    name: `${p.name} (copia)`,
    slug: await uniqueSlug(`${p.slug}-copia`),
    active: false,
  });
  redirect(`/admin/productos/${copy.id}?ok=duplicado`);
}

const quickSchema = z.object({
  id: z.string().min(1),
  field: z.enum(["active", "isFeatured", "isNew", "isOffer", "availability", "price", "promoPrice", "priceUsd", "promoPriceUsd"]),
  value: z.string().max(40),
});


export async function quickUpdateProductAction(fd: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = quickSchema.safeParse({ id: str(fd, "id"), field: str(fd, "field"), value: str(fd, "value") });
  if (!parsed.success) return { error: "Datos inválidos." };
  const { id, field, value } = parsed.data;
  const product = await db.products.get(id);
  if (!product) return { error: "Producto inexistente." };

  let data: UpdateInput<"products">;
  if (field === "availability") {
    if (!["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ON_ORDER"].includes(value)) return { error: "Disponibilidad inválida." };
    data = { availability: value };
  } else if (field === "price" || field === "priceUsd" || field === "promoPrice" || field === "promoPriceUsd") {
    
    const prices = { price: product.price, promoPrice: product.promoPrice, priceUsd: product.priceUsd, promoPriceUsd: product.promoPriceUsd };
    const isUsd = field === "priceUsd" || field === "promoPriceUsd";
    const priceKey = isUsd ? "priceUsd" : "price";
    const promoKey = isUsd ? "promoPriceUsd" : "promoPrice";
    const n = value.trim() ? parseMoney(value) : null;
    if (field === priceKey) {
      
      if (n === null) {
        if (value.trim()) return { error: "Precio inválido." };
        prices[priceKey] = null;
        prices[promoKey] = null;
      } else {
        if (n <= 0) return { error: "Precio inválido." };
        prices[priceKey] = n;
        if (prices[promoKey] != null && prices[promoKey]! >= n) prices[promoKey] = null;
      }
    } else {
      if (value.trim() && n === null) return { error: "Precio inválido." };
      if (n !== null && prices[priceKey] == null) return { error: "Primero cargá el precio normal." };
      if (n !== null && (n <= 0 || n >= prices[priceKey]!)) return { error: "El precio promocional debe ser menor al precio." };
      prices[promoKey] = n;
    }
    data = prices;
  } else {
    data = { [field]: value === "true" };
  }
  await db.products.update(id, data);
  revalidateSite();
  revalidatePath("/admin", "layout");
  return { ok: true };
}


export async function bulkPriceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const percent = Number(str(fd, "percent").replace(",", "."));
  const categoryId = str(fd, "categoryId");
  const currency = str(fd, "currency");
  if (!Number.isFinite(percent) || percent === 0 || percent < -90 || percent > 500) return { error: "Ingresá un porcentaje válido (ej. 10 o -5)." };

  
  const doArs = currency !== "USD";
  const doUsd = currency !== "ARS";
  const priced = (x: { price: number | null; priceUsd: number | null }) => (doArs && x.price != null) || (doUsd && x.priceUsd != null);
  const products = await db.products.where(
    (p) => (!categoryId || p.categoryId === categoryId) && (priced(p) || (p.variants ?? []).some((v) => v.ownPrice && priced(v)))
  );
  const factor = 1 + percent / 100;
  const adj = (v: number | null, on: boolean) => (on && v ? Math.round(v * factor) : v);
  await write(
    products.map((p): Op => ({
      op: "update",
      col: "products",
      id: p.id,
      data: {
        price: adj(p.price, doArs),
        promoPrice: adj(p.promoPrice, doArs),
        priceUsd: adj(p.priceUsd, doUsd),
        promoPriceUsd: adj(p.promoPriceUsd, doUsd),
        
        variants: (p.variants ?? []).map((v) =>
          v.ownPrice
            ? { ...v, price: adj(v.price, doArs), promoPrice: adj(v.promoPrice, doArs), priceUsd: adj(v.priceUsd, doUsd), promoPriceUsd: adj(v.promoPriceUsd, doUsd) }
            : v
        ),
      },
    }))
  );
  revalidateSite();
  revalidatePath("/admin", "layout");
  return { ok: true, message: `Se actualizaron ${products.length} productos (${percent > 0 ? "+" : ""}${percent}%).` };
}

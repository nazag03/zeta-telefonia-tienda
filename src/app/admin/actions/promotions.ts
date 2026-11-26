"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, write, type Op } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { bool, parseMoney, safeJson, str, zodErrors, type ActionState } from "@/lib/form";
import { UploadError, deleteImage, saveImage } from "@/lib/upload";

const schema = z
  .object({
    title: z.string().min(2, "Ingresá un título.").max(100),
    description: z.string().max(600),
    type: z.enum(["OFFER", "COMBO", "LIMITED", "NEW_ARRIVALS"]),
    badge: z.string().max(30),
    comboPrice: z.number().positive().max(1e10).nullable(),
    currency: z.enum(["ARS", "USD"]),
    startsAt: z.date().nullable(),
    endsAt: z.date().nullable(),
    active: z.boolean(),
    showOnHome: z.boolean(),
    order: z.number().int().min(-999).max(999),
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.endsAt > d.startsAt, { message: "La fecha de fin debe ser posterior al inicio.", path: ["endsAt"] });


function parseDate(raw: string) {
  if (!raw) return null;
  let iso = raw;
  if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(raw)) iso = `${raw}:00-03:00`;
  else if (/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(raw)) iso = `${raw}-03:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function savePromotionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = str(fd, "id") || undefined;
  const parsed = schema.safeParse({
    title: str(fd, "title"),
    description: str(fd, "description"),
    type: str(fd, "type") || "OFFER",
    badge: str(fd, "badge"),
    comboPrice: str(fd, "comboPrice") ? parseMoney(str(fd, "comboPrice")) : null,
    currency: str(fd, "currency") || "ARS",
    startsAt: parseDate(str(fd, "startsAt")),
    endsAt: parseDate(str(fd, "endsAt")),
    active: bool(fd, "active"),
    showOnHome: bool(fd, "showOnHome"),
    order: Number(str(fd, "order") || 0) || 0,
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const productIds = safeJson<string[]>(str(fd, "productIds"), []).filter((x) => typeof x === "string").slice(0, 60);
  const validProducts = await db.products.where((p) => productIds.includes(p.id));
  const validIds = productIds.filter((pid) => validProducts.some((p) => p.id === pid));

  const discountRaw = str(fd, "applyDiscount");
  const discount = discountRaw ? Number(discountRaw.replace(",", ".")) : 0;
  if (discountRaw && (!Number.isFinite(discount) || discount <= 0 || discount >= 95)) {
    return { fieldErrors: { applyDiscount: "Ingresá un porcentaje entre 1 y 94." }, error: "Revisá los campos." };
  }

  const existing = id ? await db.promotions.get(id) : null;
  if (id && !existing) return { error: "La promoción ya no existe." };

  let image = existing?.image ?? null;
  const file = fd.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      image = await saveImage(file, { folder: "promociones" });
      if (existing?.image) await deleteImage(existing.image);
    } else if (bool(fd, "removeImage") && existing?.image) {
      await deleteImage(existing.image);
      image = null;
    }
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "No se pudo procesar la imagen." };
  }

  let slug = slugify(d.title) || "promo";
  const clash = await db.promotions.find((p) => p.slug === slug);
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const data = { ...d, slug, description: d.description || null, badge: d.badge || null, image, productIds: validIds };

  await write([
    id ? { op: "update", col: "promotions", id, data } : { op: "create", col: "promotions", data },
    
    ...(discount > 0
      ? validProducts.filter((p) => p.price != null || p.priceUsd != null).map((p): Op => ({
          op: "update",
          col: "products",
          id: p.id,
          
          data: {
            price: p.price,
            priceUsd: p.priceUsd,
            promoPrice: p.price != null ? Math.round(p.price * (1 - discount / 100)) : null,
            promoPriceUsd: p.priceUsd != null ? Math.round(p.priceUsd * (1 - discount / 100)) : null,
            isOffer: true,
          },
        }))
      : []),
  ]);

  revalidatePath("/", "layout");
  redirect(`/admin/promociones?ok=${id ? "actualizada" : "creada"}`);
}

export async function deletePromotionAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const p = await db.promotions.get(id);
  if (!p) return;
  await db.promotions.delete(id);
  await deleteImage(p.image);
  revalidatePath("/", "layout");
}

export async function togglePromotionAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const field = str(fd, "field");
  if (field !== "active" && field !== "showOnHome") return;
  if (!(await db.promotions.get(id))) return;
  await db.promotions.update(id, { [field]: str(fd, "value") === "true" });
  revalidatePath("/", "layout");
}


export async function clearPromotionDiscountsAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const promo = await db.promotions.get(id);
  if (!promo) return;
  const existing = await db.products.where((p) => (promo.productIds ?? []).includes(p.id));
  await write(existing.map((p): Op => ({ op: "update", col: "products", id: p.id, data: { price: p.price, priceUsd: p.priceUsd, promoPrice: null, promoPriceUsd: null, isOffer: false } })));
  revalidatePath("/", "layout");
}

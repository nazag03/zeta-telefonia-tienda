"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, write, type Op } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { bool, str, zodErrors, type ActionState } from "@/lib/form";
import { UploadError, deleteImage, saveImage } from "@/lib/upload";

const schema = z.object({
  name: z.string().min(2, "Ingresá el nombre.").max(60),
  slug: z.string().max(70),
  description: z.string().max(400),
  order: z.number().int().min(-999).max(999),
  active: z.boolean(),
  showOnHome: z.boolean(),
});

export async function saveCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = str(fd, "id") || undefined;
  const parsed = schema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    description: str(fd, "description"),
    order: Number(str(fd, "order") || 0) || 0,
    active: bool(fd, "active"),
    showOnHome: bool(fd, "showOnHome"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const slug = slugify(d.slug || d.name);
  if (!slug) return { fieldErrors: { slug: "URL inválida." }, error: "Revisá los campos." };
  const clash = await db.categories.find((c) => c.slug === slug);
  if (clash && clash.id !== id) return { fieldErrors: { slug: "Ya existe una categoría con esa URL." }, error: "Revisá los campos." };

  const existing = id ? await db.categories.get(id) : null;
  if (id && !existing) return { error: "La categoría ya no existe." };

  let image = existing?.image ?? null;
  const file = fd.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      image = await saveImage(file, { folder: "categorias", maxWidth: 1000 });
      if (existing?.image) await deleteImage(existing.image);
    } else if (bool(fd, "removeImage") && existing?.image) {
      await deleteImage(existing.image);
      image = null;
    }
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "No se pudo procesar la imagen." };
  }

  const data = { ...d, slug, description: d.description || null, image };
  if (id) await db.categories.update(id, data);
  else await db.categories.create(data);

  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Categoría actualizada." : "Categoría creada." };
}

export async function deleteCategoryAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const c = await db.categories.get(id);
  if (!c) return;
  
  const products = await db.products.where((p) => p.categoryId === id);
  await write([
    { op: "delete", col: "categories", id },
    ...products.map((p): Op => ({ op: "update", col: "products", id: p.id, data: { categoryId: null } })),
  ]);
  await deleteImage(c.image);
  revalidatePath("/", "layout");
}

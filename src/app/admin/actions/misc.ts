"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, inquiries } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";
import { saveSettings, getSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/settings-schema";
import { bool, passwordSchema, safeJson, str, zodErrors, type ActionState } from "@/lib/form";
import { UploadError, deleteImage, saveImage } from "@/lib/upload";



const IMAGE_FIELDS = ["logoUrl", "heroImage", "aboutImage"] as const;

export async function saveSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser("ADMIN");
  const current = await getSettings();

  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(settingsSchema.shape)) {
    if ((IMAGE_FIELDS as readonly string[]).includes(key)) continue;
    if (["hours", "benefits", "highlights"].includes(key)) raw[key] = safeJson(str(fd, key), []);
    else raw[key] = str(fd, key);
  }
  raw.whatsapp = String(raw.whatsapp || "").replace(/\D/g, "");
  raw.instagramHandle = String(raw.instagramHandle || "").replace(/^@/, "");
  raw.hours = (raw.hours as { days: string; hours: string }[]).filter((h) => h?.days?.trim() && h?.hours?.trim());
  raw.benefits = (raw.benefits as { title: string; text: string }[]).filter((b) => b?.title?.trim());
  raw.highlights = (raw.highlights as string[]).filter((h) => typeof h === "string" && h.trim());

  const extra = z.object({
    whatsapp: z.string().regex(/^\d{10,15}$/, "Número inválido. Usá formato internacional, ej: 5493564523018."),
    email: z.union([z.literal(""), z.string().email("Email inválido.")]),
    instagramUrl: z.union([z.literal(""), z.string().url("URL inválida.")]),
    facebookUrl: z.union([z.literal(""), z.string().url("URL inválida.")]),
    tiktokUrl: z.union([z.literal(""), z.string().url("URL inválida.")]),
  });
  const check = extra.safeParse(raw);
  if (!check.success) return zodErrors(check.error);

  const uploads: Record<string, string> = {};
  try {
    for (const key of IMAGE_FIELDS) {
      const file = fd.get(`${key}File`);
      if (file instanceof File && file.size > 0) {
        uploads[key] = await saveImage(file, { folder: "sitio", maxWidth: key === "logoUrl" ? 800 : 1800 });
      } else if (bool(fd, `${key}Remove`)) {
        uploads[key] = "";
      }
    }
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "No se pudo procesar la imagen." };
  }

  const parsed = settingsSchema.safeParse({ ...current, ...raw, ...uploads });
  if (!parsed.success) return zodErrors(parsed.error);
  await saveSettings(parsed.data);
  for (const key of IMAGE_FIELDS) {
    if (key in uploads && current[key] !== uploads[key]) await deleteImage(current[key]);
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Configuración guardada. Los cambios ya se ven en la web." };
}



const testimonialSchema = z.object({
  author: z.string().min(2, "Ingresá el nombre.").max(80),
  content: z.string().min(5, "Ingresá la opinión.").max(600),
  rating: z.number().int().min(1).max(5),
  source: z.string().max(60),
  active: z.boolean(),
  order: z.number().int().min(-999).max(999),
});

export async function saveTestimonialAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser();
  const id = str(fd, "id") || undefined;
  const parsed = testimonialSchema.safeParse({
    author: str(fd, "author"),
    content: str(fd, "content"),
    rating: Number(str(fd, "rating") || 5),
    source: str(fd, "source"),
    active: bool(fd, "active"),
    order: Number(str(fd, "order") || 0) || 0,
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const data = { ...parsed.data, source: parsed.data.source || null };
  if (id) await db.testimonials.update(id, data);
  else await db.testimonials.create(data);
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Testimonio actualizado." : "Testimonio agregado." };
}

export async function deleteTestimonialAction(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  if (id) await db.testimonials.delete(id);
  revalidatePath("/", "layout");
}



export async function clearInquiriesAction(fd: FormData) {
  await requireUser("ADMIN");
  const days = Number(str(fd, "days") || 90);
  await inquiries.deleteOlderThan(new Date(Date.now() - days * 86400000));
  revalidatePath("/admin", "layout");
}



const userSchema = z.object({
  name: z.string().min(2, "Ingresá el nombre.").max(80),
  email: z.string().email("Email inválido.").max(120),
  role: z.enum(["ADMIN", "EDITOR"]),
});

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser("ADMIN");
  const parsed = userSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email").toLowerCase(), role: str(fd, "role") || "EDITOR" });
  if (!parsed.success) return zodErrors(parsed.error);
  const pass = passwordSchema.safeParse(str(fd, "password"));
  if (!pass.success) return { fieldErrors: { password: pass.error.issues[0].message }, error: "Revisá los campos." };
  if (await db.users.find((u) => u.email === parsed.data.email)) return { fieldErrors: { email: "Ya existe un usuario con ese email." }, error: "Revisá los campos." };
  await db.users.create({ ...parsed.data, passwordHash: await hashPassword(pass.data) });
  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Usuario creado." };
}

export async function updateUserAction(fd: FormData) {
  const me = await requireUser("ADMIN");
  const id = str(fd, "id");
  if (id === me.id) return; 
  const op = str(fd, "op");
  if (op === "toggle") {
    const u = await db.users.get(id);
    if (u) await db.users.update(id, { active: !u.active });
  } else if (op === "role") {
    const role = str(fd, "role");
    if ((role === "ADMIN" || role === "EDITOR") && (await db.users.get(id))) await db.users.update(id, { role });
  } else if (op === "delete") {
    if (id) await db.users.delete(id);
  }
  revalidatePath("/admin/usuarios");
}

export async function resetUserPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireUser("ADMIN");
  const pass = passwordSchema.safeParse(str(fd, "password"));
  if (!pass.success) return { error: pass.error.issues[0].message };
  const id = str(fd, "id");
  if (!(await db.users.get(id))) return { error: "El usuario ya no existe." };
  await db.users.update(id, { passwordHash: await hashPassword(pass.data) });
  return { ok: true, message: "Contraseña restablecida." };
}

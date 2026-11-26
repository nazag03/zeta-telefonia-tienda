import { z } from "zod";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; message?: string };

export const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

export const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";


export function parseMoney(raw: string): number | null {
  if (!raw) return null;
  let s = raw.replace(/[^\d.,]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const passwordSchema = z
  .string()
  .min(10, "Mínimo 10 caracteres.")
  .max(128)
  .regex(/[a-zA-Z]/, "Debe incluir letras.")
  .regex(/\d/, "Debe incluir al menos un número.");

export function zodErrors(err: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: "Revisá los campos marcados.", fieldErrors };
}

export function safeJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

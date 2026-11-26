"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clearLoginAttempts, createSession, destroySession, dummyHash, hashPassword, loginRateLimited, registerFailedLogin,
  requireUser, verifyPassword,
} from "@/lib/auth";
import { passwordSchema, str, type ActionState } from "@/lib/form";

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const next = str(fd, "next");
  if (!email || !password) return { error: "Ingresá email y contraseña." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${email}`;
  if (loginRateLimited(key)) return { error: "Demasiados intentos. Esperá 15 minutos e intentá de nuevo." };

  const user = await db.users.find((u) => u.email === email);
  
  const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !valid || !user.active) {
    registerFailedLogin(key);
    return { error: "Email o contraseña incorrectos." };
  }

  clearLoginAttempts(key);
  await db.users.update(user.id, { lastLoginAt: new Date() });
  await createSession(user);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const current = str(fd, "current");
  const next = str(fd, "next");
  const confirm = str(fd, "confirm");

  const user = await db.users.get(me.id);
  if (!user) return { error: "El usuario ya no existe." };
  if (!(await verifyPassword(current, user.passwordHash))) return { fieldErrors: { current: "La contraseña actual no es correcta." }, error: "Revisá los campos." };
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) return { fieldErrors: { next: parsed.error.issues[0].message }, error: "Revisá los campos." };
  if (next !== confirm) return { fieldErrors: { confirm: "Las contraseñas no coinciden." }, error: "Revisá los campos." };

  await db.users.update(me.id, { passwordHash: await hashPassword(next) });
  return { ok: true, message: "Contraseña actualizada." };
}

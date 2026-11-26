import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";

export type Role = "ADMIN" | "EDITOR";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

let _dummy: Promise<string> | null = null;
export function dummyHash() {
  return (_dummy ??= bcrypt.hash("zeta-dummy-password", 12));
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; role: string; name: string }) {
  const token = await signSession({ sub: user.id, role: user.role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}


export async function getCurrentUser() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const u = await db.users.get(session.sub);
  if (!u || !u.active) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, active: u.active };
}

export async function requireUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin?error=permisos");
  return user;
}


const attempts = new Map<string, { count: number; until: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX = 5;

export function loginRateLimited(key: string) {
  const a = attempts.get(key);
  return !!a && a.count >= MAX && a.until > Date.now();
}

export function registerFailedLogin(key: string) {
  const a = attempts.get(key);
  if (!a || a.until < Date.now()) attempts.set(key, { count: 1, until: Date.now() + WINDOW });
  else a.count++;
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}

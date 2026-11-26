
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "zeta_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; 

export type SessionPayload = { sub: string; role: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET no está configurado o es demasiado corto (mínimo 32 caracteres).");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role ?? ""), name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

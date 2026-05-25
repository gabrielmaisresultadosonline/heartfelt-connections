import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { withDB, readDB, type AdminUser } from "./store.server";

const COOKIE_NAME = "cert_admin_session";
const MAX_AGE_S = 60 * 60 * 24 * 7;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET ausente ou curto (mín 16 chars)");
  return s;
}

export type AdminPayload = { sub: string; email: string };

export function signAdmin(payload: AdminPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: MAX_AGE_S });
}

export function verifyAdmin(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, secret()) as AdminPayload & { exp?: number };
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function getSessionFromCookie(): AdminPayload | null {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  return verifyAdmin(token);
}

export function requireAdmin(): AdminPayload {
  const s = getSessionFromCookie();
  if (!s) throw new Error("Não autorizado");
  return s;
}

/**
 * Bootstrap: se não há admins no DB e ADMIN_EMAIL/ADMIN_PASSWORD estão setados
 * e batem com a tentativa de login, cria o admin automaticamente.
 */
export async function attemptLogin(email: string, password: string): Promise<AdminUser | null> {
  const db = await readDB();
  let admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (!admin && db.admins.length === 0) {
    const bootEmail = process.env.ADMIN_EMAIL;
    const bootPass = process.env.ADMIN_PASSWORD;
    if (bootEmail && bootPass && bootEmail.toLowerCase() === email.toLowerCase() && bootPass === password) {
      admin = await withDB(async (d) => {
        const created: AdminUser = {
          id: crypto.randomUUID(),
          email: bootEmail.toLowerCase(),
          password_hash: await bcrypt.hash(bootPass, 10),
          created_at: new Date().toISOString(),
        };
        d.admins.push(created);
        return created;
      });
      return admin;
    }
    return null;
  }

  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.password_hash);
  return ok ? admin : null;
}

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { withDB, readDB, type Student } from "./store.server";

const COOKIE = "cert_student_session";
const MAX_AGE_S = 60 * 60 * 24 * 30;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET ausente");
  return s + "::student";
}

export type StudentPayload = { sub: string; email: string };

export function signStudent(p: StudentPayload): string {
  return jwt.sign(p, secret(), { expiresIn: MAX_AGE_S });
}

export function setStudentCookie(token: string) {
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export function clearStudentCookie() {
  deleteCookie(COOKIE, { path: "/" });
}

export function getStudentSession(): StudentPayload | null {
  const t = getCookie(COOKIE);
  if (!t) return null;
  try {
    const d = jwt.verify(t, secret()) as StudentPayload;
    return { sub: d.sub, email: d.email };
  } catch {
    return null;
  }
}

/** Gera senha simples legível: ex "ALIS-4F8A". */
export function generatePassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `ALIS-${hex}`;
}

export async function attemptStudentLogin(email: string, password: string): Promise<Student | null> {
  const db = await readDB();
  const s = db.students.find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password_hash,
  );
  if (!s || !s.password_hash) return null;
  if (!(s.status === "paid" || s.status === "approved_manual")) return null;
  const ok = await bcrypt.compare(password, s.password_hash);
  return ok ? s : null;
}

/** Marca aluno como pago e gera credenciais. Retorna senha em plaintext (só nesta chamada). */
export async function markStudentPaid(opts: {
  order_nsu: string;
  transaction_nsu?: string | null;
  invoice_slug?: string | null;
  amount?: number | null;
  paid_amount?: number | null;
}): Promise<{ student: Student; password: string | null } | null> {
  return withDB(async (d) => {
    const st = d.students.find((s) => s.order_nsu === opts.order_nsu);
    if (!st) return null;
    let plaintext: string | null = null;
    if (!st.password_hash) {
      plaintext = generatePassword();
      st.password_hash = await bcrypt.hash(plaintext, 10);
    }
    st.status = "paid";
    st.transaction_nsu = opts.transaction_nsu ?? st.transaction_nsu;
    st.invoice_slug = opts.invoice_slug ?? st.invoice_slug;
    st.amount = opts.amount ?? st.amount;
    st.paid_amount = opts.paid_amount ?? st.paid_amount;
    st.paid_at = st.paid_at ?? new Date().toISOString();
    st.updated_at = new Date().toISOString();
    return { student: { ...st }, password: plaintext };
  });
}

export async function approveStudentManual(id: string): Promise<{ student: Student; password: string | null } | null> {
  return withDB(async (d) => {
    const st = d.students.find((s) => s.id === id);
    if (!st) return null;
    let plaintext: string | null = null;
    if (!st.password_hash) {
      plaintext = generatePassword();
      st.password_hash = await bcrypt.hash(plaintext, 10);
    }
    st.status = "approved_manual";
    st.paid_at = st.paid_at ?? new Date().toISOString();
    st.updated_at = new Date().toISOString();
    return { student: { ...st }, password: plaintext };
  });
}

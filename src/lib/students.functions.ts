import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDB, withDB } from "./store.server";
import { requireAdmin } from "./auth.server";
import {
  approveStudentManual,
  attemptStudentLogin,
  clearStudentCookie,
  getStudentSession,
  setStudentCookie,
  signStudent,
} from "./student-auth.server";
import { renderAccessEmail, sendMail } from "./email.server";

function baseUrl(): string {
  return (process.env.PUBLIC_BASE_URL || "https://belezalisoperfeito.online").replace(/\/+$/, "");
}

export const listStudents = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const students = [...db.students].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    students: students.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      phone: s.phone,
      status: s.status,
      order_nsu: s.order_nsu,
      amount: s.amount,
      paid_at: s.paid_at,
      created_at: s.created_at,
      updated_at: s.updated_at,
      has_password: !!s.password_hash,
      email_sent_at: s.email_sent_at,
      bumps: s.bumps ?? [],
    })),
    stats: {
      total: students.length,
      paid: students.filter((s) => s.status === "paid" || s.status === "approved_manual").length,
      pending: students.filter((s) => s.status === "pending").length,
      refunded: students.filter((s) => s.status === "refunded").length,
    },
  };
});

export const setStudentBumps = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string(),
        bumps: z.array(z.enum(["sobrancelha", "vitalicio", "cilios"])),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const bumps = Array.from(new Set(data.bumps));
    const ok = await withDB(async (d) => {
      const s = d.students.find((x) => x.id === data.id);
      if (!s) return false;
      s.bumps = bumps;
      s.updated_at = new Date().toISOString();
      return true;
    });
    return { ok };
  });

export const approveStudent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    const res = await approveStudentManual(data.id);
    if (!res) return { ok: false as const, error: "Aluno não encontrado" };
    if (res.password) {
      try {
        const { subject, html } = renderAccessEmail({
          name: res.student.name,
          email: res.student.email,
          password: res.password,
          loginUrl: `${baseUrl()}/login`,
        });
        await sendMail({ to: res.student.email, subject, html });
        await withDB(async (d) => {
          const s = d.students.find((x) => x.id === res.student.id);
          if (s) s.email_sent_at = new Date().toISOString();
        });
      } catch (e) {
        return { ok: true as const, emailed: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
    return { ok: true as const, emailed: !!res.password };
  });

export const resendStudentEmail = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    // Reset senha e reenvia
    const res = await approveStudentManual(data.id);
    if (!res) return { ok: false as const, error: "Aluno não encontrado" };
    // Se já tinha senha, gera nova
    if (!res.password) {
      const { generatePassword } = await import("./student-auth.server");
      const bcrypt = (await import("bcryptjs")).default;
      const pw = generatePassword();
      const hash = await bcrypt.hash(pw, 10);
      await withDB(async (d) => {
        const s = d.students.find((x) => x.id === data.id);
        if (s) s.password_hash = hash;
      });
      res.password = pw;
    }
    try {
      const { subject, html } = renderAccessEmail({
        name: res.student.name,
        email: res.student.email,
        password: res.password!,
        loginUrl: `${baseUrl()}/login`,
      });
      await sendMail({ to: res.student.email, subject, html });
      await withDB(async (d) => {
        const s = d.students.find((x) => x.id === data.id);
        if (s) s.email_sent_at = new Date().toISOString();
      });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    await withDB(async (d) => {
      d.students = d.students.filter((s) => s.id !== data.id);
    });
    return { ok: true };
  });

// --- Sessão do aluno ---
export const studentLogin = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }).parse(i),
  )
  .handler(async ({ data }) => {
    const s = await attemptStudentLogin(data.email, data.password);
    if (!s) return { ok: false as const, error: "E-mail ou senha inválidos, ou acesso ainda não liberado." };
    setStudentCookie(signStudent({ sub: s.id, email: s.email }));
    return { ok: true as const, name: s.name };
  });

export const studentLogout = createServerFn({ method: "POST" }).handler(async () => {
  clearStudentCookie();
  return { ok: true };
});

export const studentMe = createServerFn({ method: "GET" }).handler(async () => {
  const s = getStudentSession();
  if (!s) return { authenticated: false as const };
  const db = await readDB();
  const st = db.students.find((x) => x.id === s.sub);
  if (!st) return { authenticated: false as const };
  return { authenticated: true as const, name: st.name, email: st.email };
});

/** Aluno esqueceu a senha: gera nova e reenvia por email. */
export const studentForgotPassword = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ email: z.string().trim().email().max(200) }).parse(i))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const db = await readDB();
    const st = db.students.find((x) => x.email.toLowerCase() === email);
    // Resposta genérica p/ não vazar quem é aluno
    const generic = { ok: true as const, message: "Se este e-mail estiver cadastrado, uma nova senha foi enviada." };
    if (!st) return generic;
    if (!(st.status === "paid" || st.status === "approved_manual")) return generic;

    const { generatePassword } = await import("./student-auth.server");
    const bcrypt = (await import("bcryptjs")).default;
    const pw = generatePassword();
    const hash = await bcrypt.hash(pw, 10);
    await withDB(async (d) => {
      const s = d.students.find((x) => x.id === st.id);
      if (s) {
        s.password_hash = hash;
        s.updated_at = new Date().toISOString();
      }
    });
    try {
      const { subject, html } = renderAccessEmail({
        name: st.name,
        email: st.email,
        password: pw,
        loginUrl: `${baseUrl()}/login`,
      });
      await sendMail({ to: st.email, subject, html });
      await withDB(async (d) => {
        const s = d.students.find((x) => x.id === st.id);
        if (s) s.email_sent_at = new Date().toISOString();
      });
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
    return generic;
  });

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
  // "Aprovado" = pago via checkout atual (paid ou aprovado manual) COM valor real.
  // Migrações da Kiwify entram como paid mas com amount null → não contam no total financeiro.
  const totalApprovedCents = students.reduce((acc, s) => {
    const isApproved = s.status === "paid" || s.status === "approved_manual";
    const value = s.paid_amount ?? s.amount ?? 0;
    return isApproved && value > 0 ? acc + value : acc;
  }, 0);
  return {
    students: students.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      phone: s.phone,
      status: s.status,
      order_nsu: s.order_nsu,
      transaction_nsu: s.transaction_nsu,
      invoice_slug: s.invoice_slug,
      amount: s.amount,
      paid_amount: s.paid_amount,
      paid_at: s.paid_at,
      created_at: s.created_at,
      updated_at: s.updated_at,
      has_password: !!s.password_hash,
      email_sent_at: s.email_sent_at,
      bumps: s.bumps ?? [],
    })),
    kiwify_buyers: db.kiwify_buyers.map((b) => ({
      email: b.email,
      name: b.name,
      order_id: b.order_id,
      status: b.status,
      purchased_at: b.purchased_at,
    })),
    stats: {
      total: students.length,
      paid: students.filter((s) => s.status === "paid" || s.status === "approved_manual").length,
      pending: students.filter((s) => s.status === "pending").length,
      refunded: students.filter((s) => s.status === "refunded").length,
      total_approved_cents: totalApprovedCents,
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
    let st = db.students.find((x) => x.email.toLowerCase() === email);
    // Resposta genérica p/ não vazar quem é aluno
    const generic = { ok: true as const, message: "Se este e-mail estiver cadastrado, uma nova senha foi enviada." };

    // Bootstrap: aluna veio da Kiwify (paga) mas ainda não é student → cria com os 3 cursos liberados.
    if (!st) {
      const kb = db.kiwify_buyers.find((b) => b.email.toLowerCase() === email && b.status === "paid");
      if (!kb) return generic;
      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      await withDB(async (d) => {
        if (d.students.some((x) => x.email.toLowerCase() === email)) return;
        d.students.push({
          id: newId,
          email,
          name: kb.name || email.split("@")[0],
          phone: null,
          password_hash: null,
          status: "paid",
          order_nsu: kb.order_id ?? null,
          transaction_nsu: null,
          invoice_slug: null,
          amount: null,
          paid_amount: null,
          paid_at: kb.purchased_at ?? now,
          created_at: now,
          updated_at: now,
          email_sent_at: null,
          checkout_started_at: null,
          bumps: ["sobrancelha", "vitalicio", "cilios"],
        });
      });
      const db2 = await readDB();
      st = db2.students.find((x) => x.id === newId);
      if (!st) return generic;
    } else if (!(st.status === "paid" || st.status === "approved_manual")) {
      // Se existe mas não está paga, tenta liberar via Kiwify
      const kb = db.kiwify_buyers.find((b) => b.email.toLowerCase() === email && b.status === "paid");
      if (!kb) return generic;
      await withDB(async (d) => {
        const s = d.students.find((x) => x.id === st!.id);
        if (s) {
          s.status = "paid";
          s.paid_at = s.paid_at ?? new Date().toISOString();
          s.bumps = Array.from(new Set([...(s.bumps ?? []), "sobrancelha", "vitalicio", "cilios"]));
          s.updated_at = new Date().toISOString();
        }
      });
    } else {
      // Aluna paga existente: garante que tenha os 3 cursos da migração Kiwify
      const kb = db.kiwify_buyers.find((b) => b.email.toLowerCase() === email && b.status === "paid");
      if (kb) {
        const desired = ["sobrancelha", "vitalicio", "cilios"];
        const current = new Set(st.bumps ?? []);
        if (desired.some((b) => !current.has(b))) {
          await withDB(async (d) => {
            const s = d.students.find((x) => x.id === st!.id);
            if (s) {
              s.bumps = Array.from(new Set([...(s.bumps ?? []), ...desired]));
              s.updated_at = new Date().toISOString();
            }
          });
        }
      }
    }

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

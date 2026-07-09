import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { withDB, readDB, BUMPS, type Student } from "./store.server";
import { createCheckoutLink, checkPayment } from "./infinitepay.server";
import { markStudentPaid } from "./student-auth.server";
import { renderAccessEmail, sendMail } from "./email.server";

function baseUrl(): string {
  const envUrl = process.env.PUBLIC_BASE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  try {
    const req = getRequest();
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://belezalisoperfeito.online";
  }
}

const BASE_PRICE = 1000; // R$10 curso
const BASE_DESC = "Curso de Alisamento Perfeito - Acesso Vitalicio";
const CHECKOUT_TTL_MS = 20 * 60 * 1000; // 20 min

function newOrderNsu(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const createStudentCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(200),
        phone: z.string().trim().min(8).max(30),
        bumps: z.array(z.enum(["sobrancelha", "vitalicio", "cilios"])).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const emailLower = data.email.toLowerCase();
    const now = new Date().toISOString();
    const bumps = Array.from(new Set(data.bumps));
    const bumpItems = BUMPS.filter((b) => bumps.includes(b.id));
    const totalCents = BASE_PRICE + bumpItems.reduce((s, b) => s + b.price_cents, 0);

    // Cria/atualiza registro pendente. Sempre gera NOVO order_nsu quando ainda não foi pago
    // (retries, expirados, etc), garantindo verificação limpa a cada tentativa.
    const student: Student = await withDB(async (d) => {
      let s = d.students.find((x) => x.email.toLowerCase() === emailLower);
      if (!s) {
        s = {
          id: crypto.randomUUID(),
          email: emailLower,
          name: data.name,
          phone: data.phone,
          password_hash: null,
          status: "pending",
          order_nsu: newOrderNsu(),
          transaction_nsu: null,
          invoice_slug: null,
          amount: totalCents,
          paid_amount: null,
          paid_at: null,
          created_at: now,
          updated_at: now,
          email_sent_at: null,
          checkout_started_at: now,
          bumps,
        };
        d.students.push(s);
      } else {
        s.name = data.name;
        s.phone = data.phone;
        s.updated_at = now;
        if (!s.paid_at && s.status !== "paid" && s.status !== "approved_manual") {
          // Retry ou renovação após expirar → novo NSU, nova janela de 20 min
          s.order_nsu = newOrderNsu();
          s.status = "pending";
          s.amount = totalCents;
          s.bumps = bumps;
          s.transaction_nsu = null;
          s.invoice_slug = null;
          s.checkout_started_at = now;
        }
      }
      return { ...s };
    });

    const base = baseUrl();
    const phoneClean = data.phone.replace(/\D/g, "");
    const phone = phoneClean.startsWith("55") ? `+${phoneClean}` : `+55${phoneClean}`;

    const items = [
      { quantity: 1, price: BASE_PRICE, description: BASE_DESC },
      ...bumpItems.map((b) => ({ quantity: 1, price: b.price_cents, description: b.description })),
    ];

    const link = await createCheckoutLink({
      order_nsu: student.order_nsu!,
      items,
      redirect_url: `${base}/obrigado?nsu=${encodeURIComponent(student.order_nsu!)}`,
      webhook_url: `${base}/api/public/infinitepay-webhook`,
      customer: { name: data.name, email: data.email, phone_number: phone },
    });

    if (!link.ok) return { ok: false as const, error: link.error };
    return {
      ok: true as const,
      url: link.url,
      order_nsu: student.order_nsu,
      total: totalCents,
    };
  });

/**
 * Polling do status do checkout (usado pela /obrigado).
 * - Consulta InfinitePay pelo NSU. Se pago → marca aluno como pago + envia email.
 * - Se passou de 20 min sem pagar → marca como "expired".
 * Retorna o estado atual visível pro cliente.
 */
export const pollCheckoutStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ order_nsu: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const db = await readDB();
    const st = db.students.find((s) => s.order_nsu === data.order_nsu);
    if (!st) return { status: "unknown" as const };

    if (st.status === "paid" || st.status === "approved_manual") {
      return {
        status: "approved" as const,
        email: st.email,
        email_sent: !!st.email_sent_at,
      };
    }

    // Consulta InfinitePay
    const check = await checkPayment({
      order_nsu: st.order_nsu!,
      transaction_nsu: st.transaction_nsu ?? undefined,
      slug: st.invoice_slug ?? undefined,
    });

    if (check && check.success && check.paid) {
      const result = await markStudentPaid({
        order_nsu: st.order_nsu!,
        transaction_nsu: st.transaction_nsu ?? null,
        invoice_slug: st.invoice_slug ?? null,
        amount: check.amount ?? null,
        paid_amount: check.paid_amount ?? null,
      });
      if (result?.password) {
        try {
          const { subject, html } = renderAccessEmail({
            name: result.student.name,
            email: result.student.email,
            password: result.password,
            loginUrl: `${baseUrl()}/login`,
          });
          await sendMail({ to: result.student.email, subject, html });
          await withDB(async (d) => {
            const s = d.students.find((x) => x.id === result.student.id);
            if (s) s.email_sent_at = new Date().toISOString();
          });
        } catch (e) {
          console.error("[pollCheckoutStatus] email falhou", e);
        }
      }
      return { status: "approved" as const, email: st.email, email_sent: true };
    }

    // Verifica expiração (20 min)
    const startedAt = st.checkout_started_at
      ? new Date(st.checkout_started_at).getTime()
      : new Date(st.created_at).getTime();
    const elapsed = Date.now() - startedAt;
    if (elapsed > CHECKOUT_TTL_MS && st.status === "pending") {
      await withDB(async (d) => {
        const s = d.students.find((x) => x.id === st.id);
        if (s && s.status === "pending") {
          s.status = "expired";
          s.updated_at = new Date().toISOString();
        }
      });
      return { status: "expired" as const };
    }

    const remainingMs = Math.max(0, CHECKOUT_TTL_MS - elapsed);
    return { status: "pending" as const, remaining_ms: remainingMs };
  });

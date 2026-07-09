import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { withDB, type Student } from "./store.server";
import { createCheckoutLink } from "./infinitepay.server";

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

export const createStudentCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(200),
        phone: z.string().trim().min(8).max(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const emailLower = data.email.toLowerCase();
    const now = new Date().toISOString();

    // Cria/atualiza registro pendente e retorna o order_nsu
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
          order_nsu: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          transaction_nsu: null,
          invoice_slug: null,
          amount: 1000,
          paid_amount: null,
          paid_at: null,
          created_at: now,
          updated_at: now,
          email_sent_at: null,
        };
        d.students.push(s);
      } else {
        s.name = data.name;
        s.phone = data.phone;
        s.updated_at = now;
        // se ainda não pago, reaproveita ou cria novo order_nsu
        if (!s.paid_at) {
          s.order_nsu = s.order_nsu ?? `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        }
      }
      return { ...s };
    });

    const base = baseUrl();
    const phoneClean = data.phone.replace(/\D/g, "");
    const phone = phoneClean.startsWith("55") ? `+${phoneClean}` : `+55${phoneClean}`;

    const link = await createCheckoutLink({
      order_nsu: student.order_nsu!,
      price_cents: 1000,
      description: "Curso de Alisamento Perfeito - Acesso Vitalicio",
      redirect_url: `${base}/obrigado`,
      webhook_url: `${base}/api/public/infinitepay-webhook`,
      customer: { name: data.name, email: data.email, phone_number: phone },
    });

    if (!link.ok) return { ok: false as const, error: link.error };
    return { ok: true as const, url: link.url, order_nsu: student.order_nsu };
  });

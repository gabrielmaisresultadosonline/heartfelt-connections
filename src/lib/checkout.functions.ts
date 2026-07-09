import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { withDB, BUMPS, type Student } from "./store.server";
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

const BASE_PRICE = 1000; // R$10 curso
const BASE_DESC = "Curso de Alisamento Perfeito - Acesso Vitalicio";

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
          amount: totalCents,
          paid_amount: null,
          paid_at: null,
          created_at: now,
          updated_at: now,
          email_sent_at: null,
          bumps,
        };
        d.students.push(s);
      } else {
        s.name = data.name;
        s.phone = data.phone;
        s.updated_at = now;
        if (!s.paid_at) {
          s.order_nsu = s.order_nsu ?? `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          s.amount = totalCents;
          s.bumps = bumps;
        }
      }
      return { ...s! };
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
      redirect_url: `${base}/obrigado`,
      webhook_url: `${base}/api/public/infinitepay-webhook`,
      customer: { name: data.name, email: data.email, phone_number: phone },
    });

    if (!link.ok) return { ok: false as const, error: link.error };
    return { ok: true as const, url: link.url, order_nsu: student.order_nsu, total: totalCents };
  });

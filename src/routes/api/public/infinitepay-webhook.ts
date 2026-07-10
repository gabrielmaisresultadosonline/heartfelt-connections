import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withDB } from "@/lib/store.server";
import { checkPayment } from "@/lib/infinitepay.server";
import { markStudentPaid } from "@/lib/student-auth.server";
import { renderAccessEmail, sendMail } from "@/lib/email.server";
import { sendPurchaseEvent } from "@/lib/meta-capi.server";

const bodySchema = z.object({
  invoice_slug: z.string().optional(),
  order_nsu: z.string().optional(),
  transaction_nsu: z.string().optional(),
  amount: z.number().optional(),
  paid_amount: z.number().optional(),
  capture_method: z.string().optional(),
});

function baseUrl(): string {
  return (process.env.PUBLIC_BASE_URL || "https://belezalisoperfeito.online").replace(/\/+$/, "");
}

async function handle(request: Request): Promise<Response> {
  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return new Response("bad body", { status: 400 });
  }
  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    console.error("[infinitepay-webhook] payload inválido", raw);
    return new Response("invalid payload", { status: 400 });
  }
  const p = parsed.data;
  if (!p.order_nsu) return new Response("missing order_nsu", { status: 400 });

  // Verificação de autenticidade: consulta payment_check na InfinitePay
  const check = await checkPayment({
    order_nsu: p.order_nsu,
    transaction_nsu: p.transaction_nsu,
    slug: p.invoice_slug,
  });
  if (!check || !check.success || !check.paid) {
    console.warn("[infinitepay-webhook] pagamento não confirmado", p.order_nsu);
    return new Response("not paid", { status: 400 });
  }

  const result = await markStudentPaid({
    order_nsu: p.order_nsu,
    transaction_nsu: p.transaction_nsu ?? null,
    invoice_slug: p.invoice_slug ?? null,
    amount: check.amount ?? p.amount ?? null,
    paid_amount: check.paid_amount ?? p.paid_amount ?? null,
  });
  if (!result) {
    console.warn("[infinitepay-webhook] aluno não encontrado para order", p.order_nsu);
    return new Response("student not found", { status: 200 });
  }

  if (result.password) {
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
      console.error("[infinitepay-webhook] erro ao enviar email", e);
    }
  }
  return new Response("ok", { status: 200 });
}

export const Route = createFileRoute("/api/public/infinitepay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async () => new Response("ok", { status: 200 }),
    },
  },
});

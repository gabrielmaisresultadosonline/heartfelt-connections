import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { withDB, type KiwifyBuyer } from "@/lib/store.server";

function mapStatus(raw: string | undefined): KiwifyBuyer["status"] {
  const s = (raw || "").toLowerCase();
  if (s === "paid" || s === "approved") return "paid";
  if (s === "refunded") return "refunded";
  if (s === "chargedback" || s === "chargeback") return "chargeback";
  if (s === "waiting_payment" || s === "pending") return "waiting_payment";
  return "other";
}

export const Route = createFileRoute("/api/public/kiwify-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.KIWIFY_WEBHOOK_TOKEN;
        if (!token) {
          console.error("KIWIFY_WEBHOOK_TOKEN não configurado");
          return new Response("Server misconfigured", { status: 500 });
        }

        const url = new URL(request.url);
        const signature = url.searchParams.get("signature");
        const rawBody = await request.text();

        if (!signature) {
          return new Response("Missing signature", { status: 401 });
        }

        const expected = createHmac("sha1", token).update(rawBody).digest("hex");
        const sigBuf = Buffer.from(signature, "utf8");
        const expBuf = Buffer.from(expected, "utf8");
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
          console.warn("Kiwify webhook: assinatura inválida");
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Extrai campos (Kiwify varia entre Customer/customer e order_status/webhook_event_type)
        const customer =
          (payload.Customer as Record<string, unknown> | undefined) ??
          (payload.customer as Record<string, unknown> | undefined) ??
          {};
        const email = String(customer.email ?? "").trim().toLowerCase();
        const name =
          (customer.full_name as string | undefined) ??
          (customer.first_name as string | undefined) ??
          null;

        if (!email) {
          return new Response("Missing email", { status: 400 });
        }

        const status = mapStatus(
          (payload.order_status as string | undefined) ??
            (payload.webhook_event_type as string | undefined),
        );

        const orderId =
          (payload.order_id as string | undefined) ??
          (payload.order_ref as string | undefined) ??
          null;

        const product = payload.Product as Record<string, unknown> | undefined;
        const productId =
          (payload.product_id as string | undefined) ??
          (product?.product_id as string | undefined) ??
          null;

        await withDB(async (db) => {
          const now = new Date().toISOString();
          const existing = db.kiwify_buyers.find((b) => b.email === email);
          if (existing) {
            existing.status = status;
            existing.updated_at = now;
            if (name) existing.name = name;
            if (orderId) existing.order_id = orderId;
            if (productId) existing.product_id = productId;
          } else {
            db.kiwify_buyers.unshift({
              email,
              name,
              order_id: orderId,
              product_id: productId,
              status,
              purchased_at: now,
              updated_at: now,
            });
          }
        });

        return Response.json({ ok: true });
      },
    },
  },
});

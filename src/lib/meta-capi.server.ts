/**
 * Meta Conversions API — envio server-side do evento Purchase.
 *
 * Roda no webhook da InfinitePay assim que o pagamento é confirmado, de forma
 * que o Purchase seja contabilizado no Pixel do Facebook mesmo quando o
 * comprador fechou a aba /obrigado antes da confirmação (comum em PIX).
 *
 * Dedupe: usamos `event_id = order_nsu`. Se o cliente também disparar o
 * evento client-side com o mesmo event_id, o Meta considera como 1 só.
 *
 * Requer as variáveis de ambiente:
 *   - META_PIXEL_ID          (default: 3107330676076780 — o pixel do projeto)
 *   - META_CAPI_ACCESS_TOKEN (obrigatório; sem ele o envio é ignorado)
 *   - META_TEST_EVENT_CODE   (opcional, para "Testar eventos" no Meta)
 */

import { createHash } from "crypto";

const DEFAULT_PIXEL_ID = "3107330676076780";

function sha256Lower(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const norm = v.trim().toLowerCase();
  if (!norm) return undefined;
  return createHash("sha256").update(norm).digest("hex");
}

function normalizePhone(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export type MetaPurchaseInput = {
  eventId: string;              // dedupe key (usar order_nsu)
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  amountCents: number;
  currency?: string;            // default BRL
  sourceUrl?: string;           // ex: https://.../obrigado
  clientIp?: string | null;
  userAgent?: string | null;
};

export async function sendPurchaseEvent(input: MetaPurchaseInput): Promise<
  { ok: true; response: unknown } | { ok: false; error: string }
> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!accessToken) {
    console.warn("[meta-capi] META_CAPI_ACCESS_TOKEN ausente — Purchase server-side não enviado");
    return { ok: false, error: "missing_access_token" };
  }

  const [firstName, ...rest] = (input.name || "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  const user_data: Record<string, unknown> = {
    em: sha256Lower(input.email) ? [sha256Lower(input.email)] : undefined,
    ph: sha256Lower(normalizePhone(input.phone)) ? [sha256Lower(normalizePhone(input.phone))] : undefined,
    fn: sha256Lower(firstName) ? [sha256Lower(firstName)] : undefined,
    ln: lastName ? [sha256Lower(lastName)] : undefined,
    country: [sha256Lower("br")],
    client_ip_address: input.clientIp || undefined,
    client_user_agent: input.userAgent || undefined,
  };
  for (const k of Object.keys(user_data)) if (user_data[k] === undefined) delete user_data[k];

  const value = Math.round(input.amountCents) / 100;

  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: input.sourceUrl,
    user_data,
    custom_data: {
      value,
      currency: input.currency || "BRL",
      order_id: input.eventId,
    },
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const text = await res.text();
    if (!res.ok) {
      console.error(`[meta-capi] falha ${res.status}: ${text}`);
      return { ok: false, error: `http_${res.status}: ${text}` };
    }
    console.log(`[meta-capi] Purchase enviado (event_id=${input.eventId}, value=${value})`);
    return { ok: true, response: text };
  } catch (e) {
    console.error("[meta-capi] erro fetch", e);
    return { ok: false, error: String(e) };
  }
}

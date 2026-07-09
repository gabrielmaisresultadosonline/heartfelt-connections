// InfinitePay Checkout Integrado
// https://api.checkout.infinitepay.io
const HANDLE = process.env.INFINITEPAY_HANDLE || "paguemro";
const API_LINKS = "https://api.checkout.infinitepay.io/links";
const API_CHECK = "https://api.checkout.infinitepay.io/payment_check";

export type CreateLinkInput = {
  order_nsu: string;
  price_cents: number; // 1000 = R$10
  description: string;
  redirect_url: string;
  webhook_url: string;
  customer: { name: string; email: string; phone_number: string };
};

export async function createCheckoutLink(
  input: CreateLinkInput,
): Promise<{ ok: true; url: string; raw: unknown } | { ok: false; error: string }> {
  const payload = {
    handle: HANDLE,
    items: [
      { quantity: 1, price: input.price_cents, description: input.description },
    ],
    order_nsu: input.order_nsu,
    redirect_url: input.redirect_url,
    webhook_url: input.webhook_url,
    customer: input.customer,
  };
  try {
    const res = await fetch(API_LINKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    const url = extractUrl(data);
    if (!url) return { ok: false, error: "Resposta sem URL: " + text.slice(0, 200) };
    return { ok: true, url, raw: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function extractUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  for (const k of ["url", "link", "checkout_url", "payment_url"]) {
    const v = d[k];
    if (typeof v === "string" && v.startsWith("http")) return v;
  }
  return null;
}

export type PaymentCheck = {
  success: boolean;
  paid: boolean;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
};

export async function checkPayment(opts: {
  order_nsu: string;
  transaction_nsu?: string;
  slug?: string;
}): Promise<PaymentCheck | null> {
  try {
    const res = await fetch(API_CHECK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: HANDLE,
        order_nsu: opts.order_nsu,
        transaction_nsu: opts.transaction_nsu,
        slug: opts.slug,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as PaymentCheck;
  } catch {
    return null;
  }
}

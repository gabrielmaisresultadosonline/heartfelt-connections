import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromCookie } from "./auth.server";
import { withDB, readDB, type KiwifyBuyer } from "./store.server";

function requireAdmin() {
  const s = getSessionFromCookie();
  if (!s) throw new Error("Não autorizado");
  return s;
}

export const listBuyers = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const buyers = [...db.kiwify_buyers].sort((a, b) =>
    (b.updated_at || "").localeCompare(a.updated_at || ""),
  );
  const stats = {
    total: buyers.length,
    paid: buyers.filter((b) => b.status === "paid").length,
    refunded: buyers.filter((b) => b.status === "refunded" || b.status === "chargeback").length,
    waiting: buyers.filter((b) => b.status === "waiting_payment").length,
  };
  return { buyers, stats };
});

export const deleteBuyer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().email().max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const email = data.email.trim().toLowerCase();
    await withDB(async (db) => {
      db.kiwify_buyers = db.kiwify_buyers.filter((b) => b.email !== email);
    });
    return { ok: true };
  });

/**
 * Parser CSV simples (suporta vírgula, ponto-e-vírgula, tab; aspas duplas).
 */
function parseCSV(text: string): string[][] {
  // detecta separador
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const sep =
    firstLine.includes(";") && !firstLine.includes(",")
      ? ";"
      : firstLine.includes("\t")
      ? "\t"
      : ",";
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) {
        row.push(cur);
        cur = "";
      } else if (ch === "\n") {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else if (ch === "\r") {
        // ignore
      } else cur += ch;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function normalizeHeader(h: string) {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function mapKiwifyStatus(raw: string): KiwifyBuyer["status"] {
  const v = raw.toLowerCase().trim();
  if (!v) return "paid"; // sem coluna de status -> assume pago (lista de alunas)
  if (
    v.includes("aprovad") ||
    v.includes("pago") ||
    v === "paid" ||
    v.includes("approved") ||
    v.includes("conclu") ||
    v.includes("complet")
  )
    return "paid";
  if (v.includes("reembol") || v.includes("refund")) return "refunded";
  if (v.includes("charge") || v.includes("contest")) return "chargeback";
  if (v.includes("aguard") || v.includes("pend") || v.includes("wait")) return "waiting_payment";
  return "other";
}

export const importBuyersCSV = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        csvText: z.string().min(1).max(5_000_000), // ~5MB
        defaultStatus: z
          .enum(["paid", "refunded", "chargeback", "waiting_payment", "other"])
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const rows = parseCSV(data.csvText);
    if (rows.length < 2) {
      return { ok: false as const, error: "CSV vazio ou sem dados" };
    }
    const headers = rows[0].map((h) => normalizeHeader(h));
    const emailIdx = headers.findIndex(
      (h) => h === "email" || h === "emailcomprador" || h.includes("email"),
    );
    if (emailIdx === -1) {
      return { ok: false as const, error: "Coluna de email não encontrada no CSV" };
    }
    const nameIdx = headers.findIndex(
      (h) =>
        h === "nome" ||
        h === "name" ||
        h === "nomecomprador" ||
        h === "nomecliente" ||
        h.includes("nome"),
    );
    const statusIdx = headers.findIndex(
      (h) => h === "status" || h === "situacao" || h.includes("status"),
    );
    const orderIdx = headers.findIndex(
      (h) => h === "orderid" || h === "pedido" || h === "idpedido" || h.includes("order"),
    );
    const productIdx = headers.findIndex(
      (h) => h === "produto" || h === "product" || h === "productid" || h.includes("produto"),
    );

    const defaultStatus = data.defaultStatus ?? "paid";
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    await withDB(async (db) => {
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const email = (r[emailIdx] ?? "").trim().toLowerCase();
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          skipped++;
          continue;
        }
        const name = nameIdx >= 0 ? (r[nameIdx] ?? "").trim() || null : null;
        const status =
          statusIdx >= 0 ? mapKiwifyStatus(r[statusIdx] ?? "") : defaultStatus;
        const order = orderIdx >= 0 ? (r[orderIdx] ?? "").trim() || null : null;
        const product = productIdx >= 0 ? (r[productIdx] ?? "").trim() || null : null;

        const existing = db.kiwify_buyers.find((b) => b.email === email);
        if (existing) {
          existing.name = name ?? existing.name;
          existing.status = status;
          existing.order_id = order ?? existing.order_id;
          existing.product_id = product ?? existing.product_id;
          existing.updated_at = now;
          updated++;
        } else {
          db.kiwify_buyers.unshift({
            email,
            name,
            order_id: order,
            product_id: product,
            status,
            purchased_at: now,
            updated_at: now,
          });
          added++;
        }
      }
    });

    return { ok: true as const, added, updated, skipped, total: rows.length - 1 };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromCookie } from "./auth.server";
import { readDB, withDB, type EmailSend } from "./store.server";
import { sendMail } from "./email.server";

function requireAdmin() {
  const s = getSessionFromCookie();
  if (!s) throw new Error("Não autorizado");
  return s;
}

const MIGRATION_CAMPAIGN = "migracao-kiwify";
const LOGIN_URL = "https://belezalisoperfeito.online/login";
const FORGOT_URL = "https://belezalisoperfeito.online/login?forgot=1";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Template 100% em tabelas — funciona em Gmail, Outlook, Apple Mail, celulares.
 * Sem <style> externo, sem media queries frágeis; layout fluido baseado em max-width.
 */
export function renderMigrationEmail(opts: { name: string | null }): {
  subject: string;
  html: string;
  text: string;
} {
  const nameSafe = escapeHtml((opts.name?.trim() || "Aluna").split(" ")[0]);
  const subject = "Seu Curso Atualizou! ✨ Nova Área de Membros";
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdf2f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(216,34,152,0.08);">
          <tr>
            <td style="background:#d82298;padding:32px 24px;text-align:center;color:#ffffff;">
              <div style="font-size:14px;letter-spacing:2px;opacity:0.9;margin-bottom:8px;">BELEZA LISO PERFEITO</div>
              <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:800;">Seu Curso Atualizou! ✨</h1>
              <p style="margin:10px 0 0;font-size:15px;opacity:0.95;">Nova área de membros com bônus inclusos</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="font-size:16px;line-height:1.6;margin:0 0 14px;">Oi, <strong>${nameSafe}</strong>! 💗</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 14px;">
                Estamos mudando nossa <strong>área de membros</strong> para uma nova plataforma muito melhor.
                Peço desculpas pelo transtorno — foi necessário para entregar o <strong>melhor conteúdo</strong> pra você!
              </p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 14px;">
                Para compensar, sua nova área agora vem com <strong>bônus inclusos</strong> 🎁 e conteúdo atualizado.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdf2f8;border-radius:12px;border:1px solid #f5d3e7;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#7a1252;letter-spacing:0.5px;text-transform:uppercase;">Como acessar</p>
                    <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#1a1a1a;">
                      <li>Acesse a nova área com seu e-mail</li>
                      <li>Clique em <strong>"Esqueci a senha"</strong></li>
                      <li>Você receberá um link para <strong>criar uma nova senha</strong></li>
                      <li>Pronto! Aproveite o conteúdo + bônus 🎉</li>
                    </ol>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 24px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background:#d82298;border-radius:999px;">
                    <a href="${FORGOT_URL}" style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                      Recuperar senha agora
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-size:13px;color:#666;">
                Ou entre direto em: <a href="${LOGIN_URL}" style="color:#d82298;text-decoration:none;font-weight:bold;">belezalisoperfeito.online/login</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 28px;">
              <p style="font-size:13px;line-height:1.6;color:#666;margin:0;text-align:center;">
                Qualquer dúvida, é só responder este e-mail. Estamos com você! 💖
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#fdf2f8;padding:16px 24px;text-align:center;border-top:1px solid #f5d3e7;">
              <p style="margin:0;font-size:11px;color:#999;">
                Beleza Liso Perfeito · suporte@belezalisoperfeito.online
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Oi, ${nameSafe}!`,
    ``,
    `Estamos mudando nossa área de membros para uma plataforma nova e melhor.`,
    `Peço desculpas pelo transtorno — foi necessário para entregar o melhor conteúdo pra você!`,
    ``,
    `Sua nova área agora vem com BÔNUS INCLUSOS.`,
    ``,
    `Como acessar:`,
    `1) Acesse: ${LOGIN_URL}`,
    `2) Clique em "Esqueci a senha"`,
    `3) Use seu e-mail para receber o link de nova senha`,
    `4) Aproveite o conteúdo + bônus!`,
    ``,
    `Recuperar senha: ${FORGOT_URL}`,
    ``,
    `Beleza Liso Perfeito · suporte@belezalisoperfeito.online`,
  ].join("\n");

  return { subject, html, text };
}

/** Lista histórico de envios (desc) + stats. */
export const listEmailSends = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const sends = [...db.email_sends].sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  const stats = {
    total: sends.length,
    sent: sends.filter((s) => s.status === "sent").length,
    failed: sends.filter((s) => s.status === "failed").length,
  };
  const migration = sends.filter((s) => s.campaign === MIGRATION_CAMPAIGN);
  const migrationEmails = new Set(migration.filter((s) => s.status === "sent").map((s) => s.email));
  return { sends: sends.slice(0, 500), stats, migration_sent_count: migrationEmails.size };
});

/**
 * Dispara envio da campanha de migração para os buyers (paid).
 * Roda em background com throttle (1 email a cada 1.2s) para não estourar SMTP.
 * `onlyNew`: pula quem já recebeu com status "sent".
 */
export const sendMigrationCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        onlyNew: z.boolean().optional().default(true),
        limit: z.number().int().min(1).max(5000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const db = await readDB();
    const alreadySent = new Set(
      db.email_sends
        .filter((s) => s.campaign === MIGRATION_CAMPAIGN && s.status === "sent")
        .map((s) => s.email),
    );

    const candidates = db.kiwify_buyers
      .filter((b) => b.status === "paid")
      .filter((b) => (data.onlyNew ? !alreadySent.has(b.email) : true));

    const targets = data.limit ? candidates.slice(0, data.limit) : candidates;

    // Fire-and-forget: envia em background com throttle.
    void (async () => {
      for (const b of targets) {
        const { subject, html, text } = renderMigrationEmail({ name: b.name });
        let status: EmailSend["status"] = "sent";
        let error: string | null = null;
        try {
          await sendMail({ to: b.email, subject, html, text });
        } catch (err) {
          status = "failed";
          error = err instanceof Error ? err.message : String(err);
        }
        const entry: EmailSend = {
          id: crypto.randomUUID(),
          campaign: MIGRATION_CAMPAIGN,
          email: b.email,
          name: b.name,
          subject,
          status,
          error,
          sent_at: new Date().toISOString(),
        };
        await withDB(async (d) => {
          d.email_sends.push(entry);
        });
        // Throttle ~1.2s entre envios para respeitar limites SMTP.
        await new Promise((r) => setTimeout(r, 1200));
      }
    })();

    return {
      ok: true as const,
      queued: targets.length,
      skipped: candidates.length === targets.length ? 0 : candidates.length - targets.length,
      already_sent: alreadySent.size,
    };
  });

/** Envio de teste para um único e-mail. */
export const sendMigrationTest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().email(), name: z.string().max(200).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const { subject, html, text } = renderMigrationEmail({ name: data.name ?? null });
    try {
      await sendMail({ to: data.email, subject, html, text });
      await withDB(async (d) => {
        d.email_sends.push({
          id: crypto.randomUUID(),
          campaign: MIGRATION_CAMPAIGN + "-test",
          email: data.email,
          name: data.name ?? null,
          subject,
          status: "sent",
          error: null,
          sent_at: new Date().toISOString(),
        });
      });
      return { ok: true as const };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await withDB(async (d) => {
        d.email_sends.push({
          id: crypto.randomUUID(),
          campaign: MIGRATION_CAMPAIGN + "-test",
          email: data.email,
          name: data.name ?? null,
          subject,
          status: "failed",
          error: msg,
          sent_at: new Date().toISOString(),
        });
      });
      return { ok: false as const, error: msg };
    }
  });

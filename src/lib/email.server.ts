import { WorkerMailer } from "worker-mailer";

const HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || "suporte@belezalisoperfeito.online";
const PASS = process.env.SMTP_PASS || "";
const FROM = process.env.SMTP_FROM || `Beleza Liso Perfeito <${USER}>`;

export type SendMail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail(mail: SendMail): Promise<void> {
  if (!PASS) throw new Error("SMTP_PASS não configurado");
  const mailer = await WorkerMailer.connect({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    credentials: { username: USER, password: PASS },
    authType: "plain",
  });
  try {
    await mailer.send({
      from: FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text || stripHtml(mail.html),
    });
  } finally {
    await mailer.close().catch(() => {});
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}


export function renderAccessEmail(opts: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const { name, email, password, loginUrl } = opts;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePass = escapeHtml(password);
  const safeUrl = escapeHtml(loginUrl);
  const subject = "Seu acesso ao Curso de Alisamento Perfeito ✨";
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#d82298;color:#fff;padding:28px 24px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:24px;letter-spacing:-0.5px;">Bem-vinda, ${safeName}!</h1>
      <p style="margin:8px 0 0;opacity:0.95;font-size:14px;">Seu acesso ao curso está liberado.</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #f1e6ee;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Pagamento confirmado! Você já pode entrar na área de membros do
        <strong>Curso de Alisamento Perfeito</strong> com os dados abaixo:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fdf2f8;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:12px 16px;font-size:13px;color:#7a1252;font-weight:bold;">E-mail</td><td style="padding:12px 16px;font-size:14px;">${safeEmail}</td></tr>
        <tr><td style="padding:12px 16px;font-size:13px;color:#7a1252;font-weight:bold;border-top:1px solid #f5d3e7;">Senha</td><td style="padding:12px 16px;font-size:14px;border-top:1px solid #f5d3e7;font-family:monospace;">${safePass}</td></tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="${safeUrl}" style="display:inline-block;background:#d82298;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:bold;font-size:15px;">
          Acessar meu curso
        </a>
      </div>
      <p style="font-size:13px;color:#666;line-height:1.6;margin:16px 0 0;">
        Guarde este e-mail. Recomendamos alterar a senha após o primeiro acesso.
        Se precisar de ajuda, responda esta mensagem.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:20px;">
      Beleza Liso Perfeito &middot; suporte@belezalisoperfeito.online
    </p>
  </div>
</body></html>`;
  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

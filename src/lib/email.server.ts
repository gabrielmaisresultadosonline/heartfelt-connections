export type SendMail = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

export async function sendMail(mail: SendMail): Promise<void> {
  const config = await getSmtpConfig();
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text || stripHtml(mail.html),
  });
}

type EnvMap = Record<string, string>;

const SMTP_PASS_PLACEHOLDERS = new Set([
  "preencha-a-senha-do-email",
  "senha-do-email",
  "sua-senha-do-email",
  "troque-esta-senha",
]);

async function getSmtpConfig(): Promise<SmtpConfig> {
  const fileEnv = await readLocalEnvFile();
  const host = getEnvValue("SMTP_HOST", fileEnv, "smtp.hostinger.com");
  const port = Number(getEnvValue("SMTP_PORT", fileEnv, "465"));
  const user = getEnvValue("SMTP_USER", fileEnv, "suporte@belezalisoperfeito.online");
  const pass = getEnvValue("SMTP_PASS", fileEnv, "");
  const from = getEnvValue("SMTP_FROM", fileEnv, `Beleza Liso Perfeito <${user}>`);

  if (!pass || SMTP_PASS_PLACEHOLDERS.has(pass)) {
    throw new Error(
      "SMTP_PASS não configurado. Configure a senha da caixa de e-mail da Hostinger no arquivo .env do servidor e rode o deploy novamente.",
    );
  }
  if (!Number.isFinite(port) || port <= 0) throw new Error("SMTP_PORT inválida");

  return { host, port, user, pass, from };
}

async function readLocalEnvFile(): Promise<EnvMap> {
  const candidates = [".env", "/var/www/belezalisoperfeito.online/.env"];
  const fs = await import("fs/promises");
  const path = await import("path");
  const visited = new Set<string>();

  for (const candidate of candidates) {
    const fullPath = path.isAbsolute(candidate) ? candidate : path.join(process.cwd(), candidate);
    if (visited.has(fullPath)) continue;
    visited.add(fullPath);

    try {
      const content = await fs.readFile(fullPath, "utf8");
      return parseEnv(content);
    } catch {
      // Em preview/build sem .env local, seguimos apenas com process.env.
    }
  }

  return {};
}

function getEnvValue(key: string, fileEnv: EnvMap, fallback: string): string {
  return normalizeEnvValue(process.env[key]) ?? normalizeEnvValue(fileEnv[key]) ?? fallback;
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = stripWrappingQuotes(value.trim());
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseEnv(content: string): EnvMap {
  const env: EnvMap = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (!match) continue;

    env[match[1]] = stripWrappingQuotes(match[2].trim());
  }

  return env;
}

function stripWrappingQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }

  return value;
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

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
  const subject = "Seu acesso ao curso ✨";
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #f1e6ee;border-radius:16px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <!-- Header -->
    <div style="background-color:#d82298;background-image:linear-gradient(135deg, #d82298 0%, #a21871 100%);padding:40px 20px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">Bem-vinda, ${safeName}!</h1>
      <p style="margin:10px 0 0;font-size:16px;opacity:0.9;font-weight:500;">Seu acesso exclusivo foi liberado com sucesso.</p>
    </div>

    <!-- Content -->
    <div style="padding:40px 30px;">
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#333;">
        Olá! Ficamos muito felizes em ter você conosco. Seu pagamento foi confirmado e sua jornada profissional começa agora!
      </p>

      <div style="background-color:#fdf2f8;border:1px solid #f5d3e7;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="margin:0 0 16px;font-size:14px;color:#d82298;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Seus Dados de Acesso</h2>
        <div style="margin-bottom:12px;">
          <span style="display:block;font-size:12px;color:#7a1252;font-weight:bold;margin-bottom:4px;">E-MAIL</span>
          <span style="display:block;font-size:16px;color:#1a1a1a;word-break:break-all;">${safeEmail}</span>
        </div>
        <div>
          <span style="display:block;font-size:12px;color:#7a1252;font-weight:bold;margin-bottom:4px;">SENHA TEMPORÁRIA</span>
          <code style="display:block;font-size:18px;color:#1a1a1a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #f5d3e7;letter-spacing:1px;">${safePass}</code>
        </div>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${safeUrl}" style="display:inline-block;background-color:#d82298;color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:9999px;font-weight:bold;font-size:16px;box-shadow:0 4px 12px rgba(216, 34, 152, 0.3);">
          ENTRAR NA ÁREA DE MEMBROS
        </a>
      </div>

      <div style="border-top:1px solid #f1e6ee;padding-top:24px;margin-top:24px;">
        <p style="font-size:14px;color:#666;line-height:1.6;margin:0;">
          <strong>Dica:</strong> Recomendamos alterar sua senha no primeiro acesso para sua total segurança.
          <br><br>
          Se tiver qualquer dificuldade para entrar, basta responder a este e-mail que nossa equipe de suporte irá te ajudar prontamente.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #f1e6ee;">
      <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
        <strong>Beleza Liso Perfeito</strong><br>
        Método Profissional de Alisamento e Estética<br>
        <a href="mailto:suporte@belezalisoperfeito.online" style="color:#d82298;text-decoration:none;">suporte@belezalisoperfeito.online</a>
      </p>
    </div>
  </div>
</body>
</html>`;
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

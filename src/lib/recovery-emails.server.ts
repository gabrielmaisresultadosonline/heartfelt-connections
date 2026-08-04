// Recuperação de checkout abandonado.
// Regra: 3 emails após checkout iniciado sem pagamento.
//   - Email #1: 50 min após checkout_started_at (se ainda pending)
//   - Email #2: 4h depois do #1
//   - Email #3: 4h depois do #2
//
// Cada envio é registrado em db.email_sends com campaign "recuperacao-N".
// A contagem/última data é derivada desse log — sem novo campo no Student.

import { withDB, readDB, type EmailSend } from "./store.server";
import { sendMail } from "./email.server";

const FIRST_DELAY_MS = 50 * 60 * 1000;
const NEXT_DELAY_MS = 4 * 60 * 60 * 1000;
const CAMPAIGN_PREFIX = "recuperacao-";

function baseUrl(): string {
  return (process.env.PUBLIC_BASE_URL || "https://belezalisoperfeito.online").replace(/\/+$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type RecoveryStep = 1 | 2 | 3;

export function renderRecoveryEmail(step: RecoveryStep, opts: { name: string }): { subject: string; html: string } {
  const name = escapeHtml(opts.name || "");
  const url = escapeHtml(`${baseUrl()}/promocc`);
  const btn = `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#d82298;color:#fff;text-decoration:none;padding:16px 36px;border-radius:999px;font-weight:bold;font-size:16px;">
      Garantir minha vaga por R$10
    </a>
  </div>`;

  if (step === 1) {
    const subject = "Vi que você começou sua compra 💗 últimas vagas por R$10";
    const html = wrap(
      subject,
      `<h1 style="margin:0 0 12px;font-size:22px;">Oi ${name || "linda"}, tudo bem?</h1>
      <p>Percebi que você <strong>iniciou sua compra</strong> do <strong>Curso de Alisamento Perfeito</strong>, mas não chegou a finalizar. 😢</p>
      <p>Ainda estamos com as <strong>últimas vagas por apenas R$10</strong>. É o preço promocional de lançamento e pode subir a qualquer momento.</p>
      <p><strong>Não perca essa oportunidade!</strong> Em poucos minutos você garante seu acesso vitalício ao método completo.</p>
      ${btn}
      <p style="font-size:13px;color:#666;">Qualquer dúvida, é só responder este e-mail. Estamos aqui pra te ajudar.</p>`,
    );
    return { subject, html };
  }

  if (step === 2) {
    const subject = "Apenas R$10 — só 10 reais, você não pode perder!";
    const html = wrap(
      subject,
      `<h1 style="margin:0 0 12px;font-size:22px;">${name || "Amor"}, é sério: só R$10 💸</h1>
      <p>Enquanto você lê este e-mail, dezenas de mulheres estão garantindo o <strong>Curso de Alisamento Perfeito</strong> por <strong>apenas R$10</strong>.</p>
      <p>Por menos do que um lanche você leva o método completo para fazer alisamento profissional em casa ou no seu salão — com <strong>acesso vitalício</strong> e certificado.</p>
      <p><strong>Aproveite antes que acabe!</strong> As vagas com esse preço estão se encerrando.</p>
      ${btn}
      <p style="font-size:13px;color:#666;">Se já tinha começado a compra, seus dados estão salvos — em 1 clique você finaliza.</p>`,
    );
    return { subject, html };
  }

  const subject = "🚨 ÚLTIMA CHAMADA — últimas vagas por R$10 estão encerrando";
  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;color:#d82298;">Última chamada, ${name || "linda"}! ⏰</h1>
    <p>Esse é o <strong>último aviso</strong>: as <strong>últimas vagas por apenas R$10</strong> do <strong>Curso de Alisamento Perfeito</strong> estão encerrando agora.</p>
    <p>Depois disso o valor volta ao normal e você perde a chance de garantir com esse preço promocional.</p>
    <p><strong>Não deixe pra depois — depois pode ser tarde.</strong></p>
    ${btn}
    <p style="font-size:13px;color:#666;">Se decidir não aproveitar, tudo bem 💗 mas queremos você conosco.</p>`,
  );
  return { subject, html };
}

function wrap(title: string, inner: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #f1e6ee;border-radius:16px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <div style="padding:40px 30px;">
      ${inner}
    </div>
    <div style="background-color:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #f1e6ee;">
      <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
        <strong>Beleza Liso Perfeito</strong><br>
        <a href="mailto:suporte@belezalisoperfeito.online" style="color:#d82298;text-decoration:none;">suporte@belezalisoperfeito.online</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Mutex em memória para evitar execuções concorrentes (o painel refetch a cada 15s)
let running: Promise<{ processed: number; sent: number; details: Array<{ email: string; step?: number; sent: boolean; reason?: string }> }> | null = null;

/** Roda a fila de recuperação. Segura para ser chamada várias vezes seguidas. */
export async function processRecoveryEmails(): Promise<{ processed: number; sent: number; details: Array<{ email: string; step?: number; sent: boolean; reason?: string }> }> {
  if (running) return running;
  running = (async () => {
    try {
      return await runRecoveryOnce();
    } finally {
      running = null;
    }
  })();
  return running;
}

async function runRecoveryOnce() {
  const now = Date.now();
  const details: Array<{ email: string; step?: number; sent: boolean; reason?: string }> = [];
  let sent = 0;
  let processed = 0;

  const db = await readDB();
  // Alunos elegíveis: pending com checkout_started_at, sem pagamento
  const candidates = db.students.filter(
    (s) => s.status === "pending" && s.checkout_started_at && !s.paid_at,
  );

  for (const st of candidates) {
    processed++;
    const startedAt = new Date(st.checkout_started_at!).getTime();
    const key = st.email.toLowerCase();

    // Claim atômico: reavalia contagem e insere placeholder DENTRO do withDB.
    // Se outra execução já enviou, o count aqui reflete isso e pulamos.
    const claim = await withDB(async (d) => {
      const previous = d.email_sends
        .filter((e) => e.campaign.startsWith(CAMPAIGN_PREFIX) && e.email.toLowerCase() === key && e.status === "sent")
        .sort((a, b) => a.sent_at.localeCompare(b.sent_at));
      const count = previous.length;
      if (count >= 3) return null;
      const nextStep = (count + 1) as RecoveryStep;
      const reference = count === 0
        ? startedAt
        : new Date(previous[previous.length - 1].sent_at).getTime();
      const requiredDelay = count === 0 ? FIRST_DELAY_MS : NEXT_DELAY_MS;
      if (now - reference < requiredDelay) return null;

      const { subject, html } = renderRecoveryEmail(nextStep, { name: st.name });
      const record: EmailSend = {
        id: crypto.randomUUID(),
        campaign: `${CAMPAIGN_PREFIX}${nextStep}`,
        email: st.email,
        name: st.name,
        subject,
        status: "sent", // otimista; se falhar, corrigimos abaixo
        error: null,
        sent_at: new Date().toISOString(),
      };
      d.email_sends.push(record);
      return { record, subject, html, nextStep };
    });

    if (!claim) continue;

    try {
      await sendMail({ to: st.email, subject: claim.subject, html: claim.html });
      sent++;
      details.push({ email: st.email, step: claim.nextStep, sent: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      details.push({ email: st.email, step: claim.nextStep, sent: false, reason: msg });
      await withDB(async (d) => {
        const rec = d.email_sends.find((x) => x.id === claim.record.id);
        if (rec) {
          rec.status = "failed";
          rec.error = msg;
        }
      });
    }
  }

  return { processed, sent, details };
}

export async function listRecoveryEmailSends(): Promise<EmailSend[]> {
  const db = await readDB();
  // Dedupe defensivo por (email, campaign) — mantém o mais antigo
  const seen = new Map<string, EmailSend>();
  for (const e of db.email_sends) {
    if (!e.campaign.startsWith(CAMPAIGN_PREFIX)) continue;
    const key = `${e.email.toLowerCase()}::${e.campaign}`;
    const prev = seen.get(key);
    if (!prev || e.sent_at < prev.sent_at) seen.set(key, e);
  }
  return Array.from(seen.values()).sort((a, b) => b.sent_at.localeCompare(a.sent_at));
}


// Server-only: chama OpenAI para profissionalizar foto (gpt-image-1 edits)
import { readDB } from "./store.server";

const OPENAI_URL = "https://api.openai.com/v1/images/edits";

export async function professionalizePhoto(photoBytes: Uint8Array, mime: string): Promise<Uint8Array> {
  const db = await readDB();
  const key = db.settings.openai_api_key || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API key não configurada (admin → Configurações)");

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append(
    "prompt",
    "RETRATO PROFISSIONAL para certificado. REGRA MAIS IMPORTANTE: preserve 100% a identidade da pessoa — mesmo rosto, mesmos olhos, mesmo nariz, mesma boca, mesmo formato de rosto, mesmas sobrancelhas, mesma cor e tom de pele, mesmo cabelo (corte, cor, textura), mesma barba/bigode se houver, mesma idade, mesmo gênero. NÃO suavize, NÃO embeleze, NÃO altere traços faciais. A pessoa precisa ser RECONHECÍVEL como a mesma da foto enviada. Apenas troque a roupa por um blazer profissional elegante (preto, marinho ou cinza) sobre camisa/blusa. ENQUADRAMENTO: corpo inteiro da cintura para cima, INCLUINDO OS DOIS BRAÇOS COMPLETOS e os ombros — NÃO corte braços, mãos, ombros nem o topo da cabeça. Postura natural de frente. FUNDO: branco puro #FFFFFF totalmente liso, sem sombras, sem textura, sem objetos. Iluminação de estúdio suave e uniforme. Foto nítida, profissional, pronta para certificado.",
  );
  form.append("size", "1024x1024");
  form.append("quality", "medium");
  form.append("background", "opaque");
  form.append("image", new Blob([photoBytes as BlobPart], { type: mime }), "input.png");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI erro ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data: Array<{ b64_json?: string; url?: string }> };
  const item = json.data?.[0];
  if (!item) throw new Error("OpenAI não retornou imagem");

  if (item.b64_json) {
    const bin = atob(item.b64_json);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  if (item.url) {
    const imgRes = await fetch(item.url);
    return new Uint8Array(await imgRes.arrayBuffer());
  }
  throw new Error("Resposta OpenAI sem b64_json nem url");
}

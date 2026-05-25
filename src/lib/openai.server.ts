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
    "Foto profissional para certificado: preserve EXATAMENTE o rosto, traços e identidade da pessoa. Vista a pessoa com um blazer profissional elegante (preto, marinho ou cinza), fundo neutro liso (cinza claro), iluminação de estúdio suave, enquadramento de retrato dos ombros para cima, aparência limpa, moderna e profissional. NÃO altere o rosto, cabelo ou cor da pele.",
  );
  form.append("size", "1024x1024");
  form.append("quality", "medium");
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

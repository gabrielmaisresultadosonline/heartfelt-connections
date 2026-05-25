// Server-only: chama OpenAI para profissionalizar foto (gpt-image-1 edits)
import { readDB } from "./store.server";

const OPENAI_URL = "https://api.openai.com/v1/images/edits";

export async function professionalizePhoto(
  photoBytes: Uint8Array,
  mime: string,
): Promise<Uint8Array> {
  const db = await readDB();
  const key = db.settings.openai_api_key || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API key não configurada (admin → Configurações)");

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append(
    "prompt",
    "TAREFA: remover apenas o fundo da foto e substituir por branco puro #FFFFFF, preservando rigorosamente a mesma pessoa da imagem original. Não alterar rosto, olhos, nariz, boca, cabelo, pele, corpo, roupa, pose ou enquadramento. Não gerar uma nova pessoa, não embelezar, não retocar, não afinar, não reiluminar e não cortar braços, ombros, mãos ou cabeça. O resultado deve manter a identidade visual da pessoa o mais fiel possível e somente limpar o fundo.",
  );
  form.append("size", "1024x1024");
  form.append("quality", "low");
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

// Server-only: chama OpenAI para profissionalizar foto (gpt-image-1 edits)

const OPENAI_URL = "https://api.openai.com/v1/images/edits";

export async function professionalizePhoto(photoBytes: Uint8Array, mime: string): Promise<Uint8Array> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY ausente");

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append(
    "prompt",
    "Profissionalize esta foto para um certificado: preserve EXATAMENTE o rosto e identidade da pessoa, melhore iluminação, ajuste cor e contraste, fundo neutro suave (cinza claro ou bege), enquadramento de retrato profissional dos ombros para cima, aparência limpa e elegante. NÃO altere traços faciais.",
  );
  form.append("size", "1024x1024");
  form.append("image", new Blob([photoBytes], { type: mime }), "input.png");

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

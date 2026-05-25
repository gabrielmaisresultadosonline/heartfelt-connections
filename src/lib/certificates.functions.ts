import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { supabaseAdmin } from "@/integrations/external-supabase/admin.server";
import { professionalizePhoto } from "./openai.server";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export const generateCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const schema = z.object({
      fullName: z.string().trim().min(2).max(120),
      email: z.string().email().optional().or(z.literal("")),
      photoBase64: z.string().min(100),
      photoMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
    });
    return schema.parse(input);
  })
  .handler(async ({ data }) => {
    // Decode photo
    const bin = atob(data.photoBase64);
    if (bin.length > MAX_BYTES) throw new Error("Foto muito grande (máx 8MB)");
    if (!ALLOWED_MIME.includes(data.photoMime)) throw new Error("Tipo de imagem inválido");
    const photoBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) photoBytes[i] = bin.charCodeAt(i);

    // 1) Salvar foto original
    const ts = Date.now();
    const safeName = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const origPath = `${ts}-${safeName}-original.${data.photoMime.split("/")[1]}`;
    await supabaseAdmin.storage.from("photos").upload(origPath, photoBytes, {
      contentType: data.photoMime,
      upsert: false,
    });
    const { data: origPub } = supabaseAdmin.storage.from("photos").getPublicUrl(origPath);

    // 2) IA profissionaliza
    let enhancedBytes: Uint8Array;
    try {
      enhancedBytes = await professionalizePhoto(photoBytes, data.photoMime);
    } catch (e) {
      console.error("OpenAI falhou, usando original:", e);
      enhancedBytes = photoBytes;
    }
    const enhPath = `${ts}-${safeName}-enhanced.png`;
    await supabaseAdmin.storage.from("photos").upload(enhPath, enhancedBytes, {
      contentType: "image/png",
      upsert: false,
    });
    const { data: enhPub } = supabaseAdmin.storage.from("photos").getPublicUrl(enhPath);

    // 3) Buscar template
    const { data: cfg, error: cfgErr } = await supabaseAdmin
      .from("template_config")
      .select("*")
      .eq("id", 1)
      .single();
    if (cfgErr || !cfg) throw new Error("Template config não encontrada");

    let templateBytes: Uint8Array | null = null;
    let templateIsPdf = false;
    if (cfg.template_url) {
      const res = await fetch(cfg.template_url);
      const ct = res.headers.get("content-type") || "";
      templateIsPdf = ct.includes("pdf") || cfg.template_url.toLowerCase().endsWith(".pdf");
      templateBytes = new Uint8Array(await res.arrayBuffer());
    }

    // 4) Gerar PDF: template como fundo + foto profissional + nome
    const pdf = await PDFDocument.create();
    let page;
    if (templateBytes && templateIsPdf) {
      const tplDoc = await PDFDocument.load(templateBytes);
      const [copied] = await pdf.copyPages(tplDoc, [0]);
      page = pdf.addPage([copied.getWidth(), copied.getHeight()]);
      const embedded = await pdf.embedPage(copied);
      page.drawPage(embedded, { x: 0, y: 0 });
    } else if (templateBytes) {
      // PNG/JPG template
      const img = templateBytes[0] === 0xff
        ? await pdf.embedJpg(templateBytes)
        : await pdf.embedPng(templateBytes);
      page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      // Sem template — gera um placeholder A4 landscape
      page = pdf.addPage([842, 595]);
      page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(0.98, 0.96, 0.9) });
    }

    const pageH = page.getHeight();

    // Foto profissional
    const photoImg = await pdf.embedPng(enhancedBytes);
    // pdf-lib usa origem bottom-left; convertemos y "do topo" do admin
    const photoYBottom = pageH - cfg.photo_y - cfg.photo_h;
    page.drawImage(photoImg, {
      x: cfg.photo_x,
      y: photoYBottom,
      width: cfg.photo_w,
      height: cfg.photo_h,
    });

    // Nome
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const color = hexToRgb(cfg.name_color || "#000000");
    const textWidth = font.widthOfTextAtSize(data.fullName, cfg.name_font_size);
    page.drawText(data.fullName, {
      x: cfg.name_x - textWidth / 2, // name_x é o CENTRO
      y: pageH - cfg.name_y,
      size: cfg.name_font_size,
      font,
      color,
    });

    const pdfBytes = await pdf.save();
    const certPath = `${ts}-${safeName}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage.from("certificates").upload(certPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (upErr) throw new Error("Falha ao salvar PDF: " + upErr.message);
    const { data: certPub } = supabaseAdmin.storage.from("certificates").getPublicUrl(certPath);

    // 5) Registrar no banco
    const { data: row, error: insErr } = await supabaseAdmin
      .from("certificates")
      .insert({
        full_name: data.fullName,
        email: data.email || null,
        original_photo_url: origPub.publicUrl,
        enhanced_photo_url: enhPub.publicUrl,
        certificate_pdf_url: certPub.publicUrl,
        status: "completed",
      })
      .select()
      .single();
    if (insErr) throw new Error("Falha ao salvar no banco: " + insErr.message);

    return {
      id: row.id,
      pdfUrl: certPub.publicUrl,
      enhancedPhotoUrl: enhPub.publicUrl,
    };
  });

export const listCertificates = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return { certificates: data ?? [] };
});

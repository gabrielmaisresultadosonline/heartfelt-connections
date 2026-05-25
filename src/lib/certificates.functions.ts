import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { professionalizePhoto } from "./openai.server";
import {
  withDB,
  readDB,
  saveFile,
  deleteFile,
  type Certificate,
  type TemplateConfig,
} from "./store.server";
import { requireAdmin } from "./auth.server";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const ADMIN_BYPASS_EMAIL = "mro@gmail.com";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

export const enhancePhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        photoBase64: z.string().min(100),
        photoMime: z.enum(ALLOWED_MIME),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const photoBytes = b64ToBytes(data.photoBase64);
    if (photoBytes.length > MAX_BYTES) throw new Error("Foto muito grande (máx 8MB)");
    const out = await professionalizePhoto(photoBytes, data.photoMime);
    return {
      base64: bytesToB64(out),
      mime: "image/png" as const,
      mode: "background-removed" as const,
    };
  });

export const generateCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().email().optional().or(z.literal("")),
        photoBase64: z.string().min(100),
        photoMime: z.enum(ALLOWED_MIME),
        useAI: z.boolean().optional().default(false),
        photoX: z.number().optional(),
        photoY: z.number().optional(),
        photoW: z.number().positive().optional(),
        photoH: z.number().positive().optional(),
        nameX: z.number().optional(),
        nameY: z.number().optional(),
        nameFontSize: z.number().positive().optional(),
        dateText: z.string().max(40).optional(),
        dateX: z.number().optional(),
        dateY: z.number().optional(),
        dateFontSize: z.number().positive().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const email = (data.email || "").trim().toLowerCase();
    if (!email) throw new Error("Email é obrigatório para emitir o certificado");

    const isAdmin = email === ADMIN_BYPASS_EMAIL;

    // Verifica acesso via Kiwify (admin bypassa)
    const dbCheck = await readDB();
    if (!isAdmin) {
      const buyer = dbCheck.kiwify_buyers.find((b) => b.email === email);
      if (!buyer || buyer.status !== "paid") {
        throw new Error(
          "Email não autorizado. Apenas alunas que compraram o curso podem emitir o certificado.",
        );
      }
    }

    // Bloqueia segundo certificado (admin pode emitir vários)
    if (!isAdmin) {
      const existing = dbCheck.certificates.find((c) => (c.email || "").toLowerCase() === email);
      if (existing) {
        throw new Error(
          "Você já emitiu um certificado com este email. Use o botão de download para baixá-lo novamente.",
        );
      }
    }

    const photoBytes = b64ToBytes(data.photoBase64);
    if (photoBytes.length > MAX_BYTES) throw new Error("Foto muito grande (máx 8MB)");

    const ts = Date.now();
    const safeName = data.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const ext = data.photoMime.split("/")[1];

    // 1) Original
    const origRel = await saveFile(`${ts}-${safeName}-original.${ext}`, photoBytes);

    // 2) IA (opcional)
    let enhancedBytes: Uint8Array = photoBytes;
    let enhancedMime: string = data.photoMime;
    if (data.useAI) {
      try {
        enhancedBytes = await professionalizePhoto(photoBytes, data.photoMime);
        enhancedMime = "image/png";
      } catch (e) {
        console.error("OpenAI falhou, usando original:", e);
        enhancedBytes = photoBytes;
        enhancedMime = data.photoMime;
      }
    }
    const enhExt =
      enhancedMime === "image/png" ? "png" : enhancedMime === "image/jpeg" ? "jpg" : "webp";
    const enhRel = await saveFile(`${ts}-${safeName}-enhanced.${enhExt}`, enhancedBytes);

    // 3) Template
    const db = await readDB();
    const cfg = db.template_config;

    let templateBytes: Uint8Array | null = null;
    let templateIsPdf = false;
    if (cfg.template_file) {
      const { promises: fs } = await import("node:fs");
      const path = await import("node:path");
      const { FILES_DIR } = await import("./store.server");
      const buf = await fs.readFile(path.join(FILES_DIR, cfg.template_file));
      templateBytes = new Uint8Array(buf);
      templateIsPdf =
        (cfg.template_mime ?? "").includes("pdf") ||
        cfg.template_file.toLowerCase().endsWith(".pdf");
    }

    // Posição final (override do usuário ou config padrão)
    const photoX = data.photoX ?? cfg.photo_x;
    const photoY = data.photoY ?? cfg.photo_y;
    const photoW = data.photoW ?? cfg.photo_w;
    const photoH = data.photoH ?? cfg.photo_h;

    // 4) Compor PDF — fundo branco → foto → overlay por cima
    const pdf = await PDFDocument.create();
    let page;
    let pageW: number;
    let pageH: number;

    // Helper: encaixa imagem dentro da caixa preservando proporção (modo "contain"),
    // centralizando horizontal e alinhando a base verticalmente (parece mais natural pra retrato).
    function fitContain(imgW: number, imgH: number, boxW: number, boxH: number) {
      const r = Math.min(boxW / imgW, boxH / imgH);
      const w = imgW * r;
      const h = imgH * r;
      const dx = (boxW - w) / 2; // centraliza X
      const dy = boxH - h; // base alinhada (foto fica "em pé" na caixa)
      return { w, h, dx, dy };
    }

    if (templateBytes && templateIsPdf) {
      const tplDoc = await PDFDocument.load(templateBytes);
      const [copied] = await pdf.copyPages(tplDoc, [0]);
      pageW = copied.getWidth();
      pageH = copied.getHeight();
      page = pdf.addPage([pageW, pageH]);
      // fundo branco
      page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
      // foto
      const photoImg =
        enhancedMime === "image/jpeg"
          ? await pdf.embedJpg(enhancedBytes)
          : await pdf.embedPng(enhancedBytes);
      const fit = fitContain(photoImg.width, photoImg.height, photoW, photoH);
      page.drawImage(photoImg, {
        x: photoX + fit.dx,
        y: pageH - photoY - photoH + fit.dy,
        width: fit.w,
        height: fit.h,
      });
      // overlay (PDF template) por cima
      const embedded = await pdf.embedPage(copied);
      page.drawPage(embedded, { x: 0, y: 0 });
    } else if (templateBytes) {
      const isJpg = templateBytes[0] === 0xff;
      const tplImg = isJpg ? await pdf.embedJpg(templateBytes) : await pdf.embedPng(templateBytes);
      pageW = tplImg.width;
      pageH = tplImg.height;
      page = pdf.addPage([pageW, pageH]);
      // fundo branco
      page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
      // foto entre fundo e overlay
      const photoImg =
        enhancedMime === "image/jpeg"
          ? await pdf.embedJpg(enhancedBytes)
          : await pdf.embedPng(enhancedBytes);
      const fit = fitContain(photoImg.width, photoImg.height, photoW, photoH);
      page.drawImage(photoImg, {
        x: photoX + fit.dx,
        y: pageH - photoY - photoH + fit.dy,
        width: fit.w,
        height: fit.h,
      });
      // overlay PNG (com transparência) por cima
      page.drawImage(tplImg, { x: 0, y: 0, width: pageW, height: pageH });
    } else {
      pageW = 842;
      pageH = 595;
      page = pdf.addPage([pageW, pageH]);
      page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(0.98, 0.96, 0.9) });
      const photoImg =
        enhancedMime === "image/jpeg"
          ? await pdf.embedJpg(enhancedBytes)
          : await pdf.embedPng(enhancedBytes);
      const fit = fitContain(photoImg.width, photoImg.height, photoW, photoH);
      page.drawImage(photoImg, {
        x: photoX + fit.dx,
        y: pageH - photoY - photoH + fit.dy,
        width: fit.w,
        height: fit.h,
      });
    }

    // Nome (sempre por cima)
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const nameColor = hexToRgb(cfg.name_color || "#000000");
    const nameFontSize = data.nameFontSize ?? cfg.name_font_size;
    const nameX = data.nameX ?? cfg.name_x;
    const nameY = data.nameY ?? cfg.name_y;
    const textWidth = font.widthOfTextAtSize(data.fullName, nameFontSize);
    page.drawText(data.fullName, {
      x: nameX - textWidth / 2,
      y: pageH - nameY,
      size: nameFontSize,
      font,
      color: nameColor,
    });

    // Data
    const dateText =
      (data.dateText && data.dateText.trim()) || new Date().toLocaleDateString("pt-BR");
    const dateFontSize = data.dateFontSize ?? cfg.date_font_size;
    const dateX = data.dateX ?? cfg.date_x;
    const dateY = data.dateY ?? cfg.date_y;
    const dateColor = hexToRgb(cfg.date_color || "#000000");
    const dateWidth = font.widthOfTextAtSize(dateText, dateFontSize);
    page.drawText(dateText, {
      x: dateX - dateWidth / 2,
      y: pageH - dateY,
      size: dateFontSize,
      font,
      color: dateColor,
    });

    const pdfBytes = await pdf.save();
    const pdfRel = await saveFile(`${ts}-${safeName}.pdf`, pdfBytes);

    const cert: Certificate = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      full_name: data.fullName,
      email: email || null,
      original_file: origRel,
      enhanced_file: enhRel,
      pdf_file: pdfRel,
    };
    await withDB(async (d) => {
      d.certificates.unshift(cert);
    });

    return {
      id: cert.id,
      pdfUrl: `/api/files/${pdfRel}`,
      enhancedPhotoUrl: `/api/files/${enhRel}`,
    };
  });

export const listCertificates = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  return {
    certificates: db.certificates.map((c) => ({
      ...c,
      pdf_url: `/api/files/${c.pdf_file}`,
      enhanced_url: `/api/files/${c.enhanced_file}`,
      original_url: `/api/files/${c.original_file}`,
    })),
  };
});

export const deleteCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    await withDB(async (d) => {
      const idx = d.certificates.findIndex((c) => c.id === data.id);
      if (idx === -1) return;
      const c = d.certificates[idx];
      await Promise.all([
        deleteFile(c.original_file),
        deleteFile(c.enhanced_file),
        deleteFile(c.pdf_file),
      ]);
      d.certificates.splice(idx, 1);
    });
    return { ok: true };
  });

export const getTemplateConfig = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  return {
    ...db.template_config,
    template_url: db.template_config.template_file
      ? `/api/files/${db.template_config.template_file}`
      : null,
  };
});

export const getPublicTemplateConfig = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  const c = db.template_config;
  return {
    photo_x: c.photo_x,
    photo_y: c.photo_y,
    photo_w: c.photo_w,
    photo_h: c.photo_h,
    name_x: c.name_x,
    name_y: c.name_y,
    name_font_size: c.name_font_size,
    name_color: c.name_color,
    date_x: c.date_x,
    date_y: c.date_y,
    date_font_size: c.date_font_size,
    date_color: c.date_color,
    template_url: c.template_file ? `/api/files/${c.template_file}` : null,
    template_is_pdf:
      (c.template_mime ?? "").includes("pdf") ||
      (c.template_file ?? "").toLowerCase().endsWith(".pdf"),
  };
});

export const updateTemplateConfig = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        photo_x: z.number().int(),
        photo_y: z.number().int(),
        photo_w: z.number().int().positive(),
        photo_h: z.number().int().positive(),
        name_x: z.number().int(),
        name_y: z.number().int(),
        name_font_size: z.number().int().min(6).max(300),
        name_color: z.string().regex(/^#[0-9a-fA-F]{3,6}$/),
        date_x: z.number().int(),
        date_y: z.number().int(),
        date_font_size: z.number().int().min(6).max(300),
        date_color: z.string().regex(/^#[0-9a-fA-F]{3,6}$/),
        templateBase64: z.string().optional().nullable(),
        templateMime: z.string().optional().nullable(),
        templateExt: z.string().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    let templateFile: string | undefined;
    let templateMime: string | undefined;
    if (data.templateBase64 && data.templateMime && data.templateExt) {
      const bytes = b64ToBytes(data.templateBase64);
      const ext = data.templateExt.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
      templateFile = await saveFile(`template-${Date.now()}.${ext}`, bytes);
      templateMime = data.templateMime;
    }
    await withDB(async (d) => {
      const cfg: TemplateConfig = {
        ...d.template_config,
        photo_x: data.photo_x,
        photo_y: data.photo_y,
        photo_w: data.photo_w,
        photo_h: data.photo_h,
        name_x: data.name_x,
        name_y: data.name_y,
        name_font_size: data.name_font_size,
        name_color: data.name_color,
        date_x: data.date_x,
        date_y: data.date_y,
        date_font_size: data.date_font_size,
        date_color: data.date_color,
      };
      if (templateFile) {
        // remove o template antigo
        if (d.template_config.template_file) {
          await deleteFile(d.template_config.template_file);
        }
        cfg.template_file = templateFile;
        cfg.template_mime = templateMime ?? null;
      }
      d.template_config = cfg;
    });
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  return {
    openai_api_key_set: !!db.settings.openai_api_key,
    openai_api_key_preview: db.settings.openai_api_key
      ? db.settings.openai_api_key.slice(0, 7) + "..." + db.settings.openai_api_key.slice(-4)
      : null,
  };
});

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        openai_api_key: z.string().min(20).max(300).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    await withDB(async (d) => {
      d.settings.openai_api_key = data.openai_api_key;
    });
    return { ok: true };
  });

export const checkEmailAccess = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const db = await readDB();

    // Admin bypass — sempre liberado, sem bloqueio de "já emitido"
    if (email === ADMIN_BYPASS_EMAIL) {
      return {
        allowed: true as const,
        alreadyIssued: false as const,
        name: null,
      };
    }

    const buyer = db.kiwify_buyers.find((b) => b.email === email);
    if (!buyer) {
      return { allowed: false as const, reason: "not_found" as const };
    }
    if (buyer.status !== "paid") {
      return { allowed: false as const, reason: buyer.status };
    }
    const existing = db.certificates.find((c) => (c.email || "").toLowerCase() === email);
    if (existing) {
      return {
        allowed: true as const,
        alreadyIssued: true as const,
        name: buyer.name,
        pdfUrl: `/api/files/${existing.pdf_file}`,
      };
    }
    return {
      allowed: true as const,
      alreadyIssued: false as const,
      name: buyer.name,
    };
  });

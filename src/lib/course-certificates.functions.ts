import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  readDB,
  withDB,
  saveFile,
  deleteFile,
  type CourseCertConfig,
  type CourseCertificate,
  type TemplateConfig,
} from "./store.server";
import { requireAdmin } from "./auth.server";
import { getStudentSession } from "./student-auth.server";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const UNLOCK_DAYS = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
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

/** Retorna a config efetiva (override do curso ou global). */
function effectiveConfig(
  courseId: string,
  overrides: CourseCertConfig[],
  global: TemplateConfig,
): TemplateConfig {
  const ov = overrides.find((o) => o.course_id === courseId);
  return ov ? { ...global, ...ov } : global;
}

/** Retorna se o aluno tem acesso ao curso (base OU bump comprado). */
function studentOwnsCourse(
  bumps: string[],
  required_bump: string | null,
): boolean {
  return !required_bump || bumps.includes(required_bump);
}

async function composePdf(
  fullName: string,
  photoBytes: Uint8Array,
  photoMime: string,
  cfg: TemplateConfig,
): Promise<Uint8Array> {
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

  function fitContain(iw: number, ih: number, bw: number, bh: number) {
    const r = Math.min(bw / iw, bh / ih);
    const w = iw * r;
    const h = ih * r;
    return { w, h, dx: (bw - w) / 2, dy: bh - h };
  }

  const pdf = await PDFDocument.create();
  let page;
  let pageW: number;
  let pageH: number;

  if (templateBytes && templateIsPdf) {
    const tplDoc = await PDFDocument.load(templateBytes);
    const [copied] = await pdf.copyPages(tplDoc, [0]);
    pageW = copied.getWidth();
    pageH = copied.getHeight();
    page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
    const photoImg =
      photoMime === "image/jpeg"
        ? await pdf.embedJpg(photoBytes)
        : await pdf.embedPng(photoBytes);
    const fit = fitContain(photoImg.width, photoImg.height, cfg.photo_w, cfg.photo_h);
    page.drawImage(photoImg, {
      x: cfg.photo_x + fit.dx,
      y: pageH - cfg.photo_y - cfg.photo_h + fit.dy,
      width: fit.w,
      height: fit.h,
    });
    const embedded = await pdf.embedPage(copied);
    page.drawPage(embedded, { x: 0, y: 0 });
  } else if (templateBytes) {
    const isJpg = templateBytes[0] === 0xff;
    const tplImg = isJpg ? await pdf.embedJpg(templateBytes) : await pdf.embedPng(templateBytes);
    pageW = tplImg.width;
    pageH = tplImg.height;
    page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
    const photoImg =
      photoMime === "image/jpeg"
        ? await pdf.embedJpg(photoBytes)
        : await pdf.embedPng(photoBytes);
    const fit = fitContain(photoImg.width, photoImg.height, cfg.photo_w, cfg.photo_h);
    page.drawImage(photoImg, {
      x: cfg.photo_x + fit.dx,
      y: pageH - cfg.photo_y - cfg.photo_h + fit.dy,
      width: fit.w,
      height: fit.h,
    });
    page.drawImage(tplImg, { x: 0, y: 0, width: pageW, height: pageH });
  } else {
    pageW = 842;
    pageH = 595;
    page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(0.98, 0.96, 0.9) });
    const photoImg =
      photoMime === "image/jpeg"
        ? await pdf.embedJpg(photoBytes)
        : await pdf.embedPng(photoBytes);
    const fit = fitContain(photoImg.width, photoImg.height, cfg.photo_w, cfg.photo_h);
    page.drawImage(photoImg, {
      x: cfg.photo_x + fit.dx,
      y: pageH - cfg.photo_y - cfg.photo_h + fit.dy,
      width: fit.w,
      height: fit.h,
    });
  }

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const nameWidth = font.widthOfTextAtSize(fullName, cfg.name_font_size);
  page.drawText(fullName, {
    x: cfg.name_x - nameWidth / 2,
    y: pageH - cfg.name_y,
    size: cfg.name_font_size,
    font,
    color: hexToRgb(cfg.name_color || "#000000"),
  });
  const dateText = new Date().toLocaleDateString("pt-BR");
  const dateWidth = font.widthOfTextAtSize(dateText, cfg.date_font_size);
  page.drawText(dateText, {
    x: cfg.date_x - dateWidth / 2,
    y: pageH - cfg.date_y,
    size: cfg.date_font_size,
    font,
    color: hexToRgb(cfg.date_color || "#000000"),
  });

  return await pdf.save();
}

/** Lista os certificados por curso do aluno logado, com estado (locked/available/issued). */
export const listMyCertificates = createServerFn({ method: "GET" }).handler(async () => {
  const s = getStudentSession();
  if (!s) return { authenticated: false as const };
  const db = await readDB();
  const student = db.students.find((x) => x.id === s.sub);
  if (!student) return { authenticated: false as const };
  const bumps = student.bumps ?? [];
  const now = Date.now();
  const items = [...db.courses]
    .filter((c) => studentOwnsCourse(bumps, c.required_bump))
    .sort((a, b) => a.order - b.order)
    .map((c) => {
      const access = db.student_course_access.find(
        (a) => a.student_id === student.id && a.course_id === c.id,
      );
      const startTs = access
        ? new Date(access.first_access_at).getTime()
        : student.paid_at
          ? new Date(student.paid_at).getTime()
          : new Date(student.created_at).getTime();
      const unlockAt = startTs + UNLOCK_DAYS * MS_PER_DAY;
      const remainingMs = Math.max(0, unlockAt - now);
      const daysRemaining = Math.ceil(remainingMs / MS_PER_DAY);
      const available = remainingMs === 0;
      const issued = db.course_certificates.find(
        (x) => x.student_id === student.id && x.course_id === c.id,
      );
      return {
        course_id: c.id,
        slug: c.slug,
        title: c.title,
        cover_file: c.cover_file,
        unlock_at: new Date(unlockAt).toISOString(),
        days_remaining: daysRemaining,
        remaining_ms: remainingMs,
        available,
        issued_pdf_url: issued ? `/api/files/${issued.pdf_file}` : null,
      };
    });
  return { authenticated: true as const, name: student.name, items };
});

/** Aluno emite certificado de um curso específico. */
export const generateMyCertificate = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        courseId: z.string(),
        fullName: z.string().trim().min(2).max(120),
        photoBase64: z.string().min(100),
        photoMime: z.enum(ALLOWED_MIME),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const s = getStudentSession();
    if (!s) throw new Error("Faça login para emitir o certificado.");
    const db = await readDB();
    const student = db.students.find((x) => x.id === s.sub);
    if (!student) throw new Error("Aluno não encontrado.");
    const course = db.courses.find((c) => c.id === data.courseId);
    if (!course) throw new Error("Curso não encontrado.");
    if (!studentOwnsCourse(student.bumps ?? [], course.required_bump)) {
      throw new Error("Você não tem acesso a este curso.");
    }
    const access = db.student_course_access.find(
      (a) => a.student_id === student.id && a.course_id === course.id,
    );
    const startTs = access
      ? new Date(access.first_access_at).getTime()
      : student.paid_at
        ? new Date(student.paid_at).getTime()
        : new Date(student.created_at).getTime();
    const unlockAt = startTs + UNLOCK_DAYS * MS_PER_DAY;
    if (Date.now() < unlockAt) {
      const days = Math.ceil((unlockAt - Date.now()) / MS_PER_DAY);
      throw new Error(`Aguarde ${days} dia(s) para emitir este certificado.`);
    }
    const already = db.course_certificates.find(
      (x) => x.student_id === student.id && x.course_id === course.id,
    );
    if (already) {
      return { ok: true as const, pdfUrl: `/api/files/${already.pdf_file}` };
    }

    const photoBytes = b64ToBytes(data.photoBase64);
    if (photoBytes.length > MAX_BYTES) throw new Error("Foto muito grande (máx 8MB).");

    const cfg = effectiveConfig(course.id, db.course_cert_configs, db.template_config);
    const pdfBytes = await composePdf(data.fullName, photoBytes, data.photoMime, cfg);
    const safe = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const rel = await saveFile(`cert-${course.slug}-${Date.now()}-${safe}.pdf`, pdfBytes);
    const cert: CourseCertificate = {
      id: crypto.randomUUID(),
      student_id: student.id,
      course_id: course.id,
      created_at: new Date().toISOString(),
      full_name: data.fullName,
      pdf_file: rel,
    };
    await withDB(async (d) => {
      d.course_certificates.unshift(cert);
    });
    return { ok: true as const, pdfUrl: `/api/files/${rel}` };
  });

/** Admin: lista configs de certificado por curso. */
export const listCourseCertConfigs = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const courses = [...db.courses].sort((a, b) => a.order - b.order);
  return {
    global: {
      ...db.template_config,
      template_url: db.template_config.template_file
        ? `/api/files/${db.template_config.template_file}`
        : null,
    },
    courses: courses.map((c) => {
      const ov = db.course_cert_configs.find((o) => o.course_id === c.id);
      const eff = ov ? { ...db.template_config, ...ov } : db.template_config;
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        has_override: !!ov,
        config: eff,
        template_url: eff.template_file ? `/api/files/${eff.template_file}` : null,
      };
    }),
    unlock_days: UNLOCK_DAYS,
  };
});

/** Admin: atualiza config de certificado de um curso. */
export const updateCourseCertConfig = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        courseId: z.string(),
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
        clearTemplate: z.boolean().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    let templateFile: string | undefined;
    let templateMime: string | undefined;
    if (data.templateBase64 && data.templateMime && data.templateExt) {
      const bytes = b64ToBytes(data.templateBase64);
      const ext = data.templateExt.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
      templateFile = await saveFile(`cert-tpl-${data.courseId}-${Date.now()}.${ext}`, bytes);
      templateMime = data.templateMime;
    }
    await withDB(async (d) => {
      let ov = d.course_cert_configs.find((o) => o.course_id === data.courseId);
      const base: CourseCertConfig = ov ?? {
        course_id: data.courseId,
        template_file: null,
        template_mime: null,
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
      const next: CourseCertConfig = {
        ...base,
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
        if (base.template_file) await deleteFile(base.template_file);
        next.template_file = templateFile;
        next.template_mime = templateMime ?? null;
      } else if (data.clearTemplate && base.template_file) {
        await deleteFile(base.template_file);
        next.template_file = null;
        next.template_mime = null;
      }
      if (ov) {
        Object.assign(ov, next);
      } else {
        d.course_cert_configs.push(next);
      }
    });
    return { ok: true as const };
  });

// JSON-file persistence on local disk (VPS).
// Não roda no Cloudflare Worker preview — só no servidor Node da VPS.
import { promises as fs } from "node:fs";
import path from "node:path";

export const DATA_DIR = process.env.DATA_DIR || "/var/lib/certificados";
export const FILES_DIR = path.join(DATA_DIR, "files");
const DB_PATH = path.join(DATA_DIR, "db.json");

export type Certificate = {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  original_file: string;
  enhanced_file: string;
  pdf_file: string;
};

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type TemplateConfig = {
  template_file: string | null;
  template_mime: string | null;
  photo_x: number;
  photo_y: number;
  photo_w: number;
  photo_h: number;
  name_x: number;
  name_y: number;
  name_font_size: number;
  name_color: string;
  date_x: number;
  date_y: number;
  date_font_size: number;
  date_color: string;
};

export type Settings = {
  openai_api_key: string | null;
};

export type KiwifyBuyer = {
  email: string;
  name: string | null;
  order_id: string | null;
  product_id: string | null;
  status: "paid" | "refunded" | "chargeback" | "waiting_payment" | "other";
  purchased_at: string;
  updated_at: string;
};

/** Aluno / cliente do curso (InfinitePay). */
export type Student = {
  id: string;
  email: string; // lowercase
  name: string;
  phone: string | null;
  password_hash: string | null; // gerado quando aprovado
  status: "pending" | "paid" | "approved_manual" | "refunded" | "expired";
  order_nsu: string | null;
  transaction_nsu: string | null;
  invoice_slug: string | null;
  amount: number | null; // centavos
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  email_sent_at: string | null;
  /** Início da janela de 20 min de verificação para o order_nsu atual. */
  checkout_started_at: string | null;
  /** Order bumps adquiridos: "sobrancelha" | "vitalicio" */
  bumps: string[];
};

/** Módulo/aula do curso (legado — mantido para compatibilidade). */
export type CourseModule = {
  id: string;
  title: string;
  description: string;
  video_url: string; // youtube/vimeo/mp4
  order: number;
  created_at: string;
  /** Se null, faz parte do curso base. Se "sobrancelha" | "vitalicio" | "cilios", requer bump. */
  required_bump: string | null;
};

/** Curso (novo modelo). Cada curso tem capa e uma lista de assets (vídeos + PDFs). */
export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_file: string | null; // rel filename em FILES_DIR
  order: number;
  /** null = curso base (todos). "sobrancelha" | "vitalicio" | "cilios" = requer bump. */
  required_bump: string | null;
  created_at: string;
};

export type CourseAssetKind = "video" | "pdf";

export type CourseAsset = {
  id: string;
  course_id: string;
  kind: CourseAssetKind;
  title: string;
  file_rel: string; // filename em FILES_DIR
  order: number;
  size_bytes: number;
  created_at: string;
};

/** Config de certificado por curso (override do global). */
export type CourseCertConfig = TemplateConfig & { course_id: string };

/** Registra quando aluno acessou pela 1ª vez cada curso (base para contagem de 8 dias). */
export type StudentCourseAccess = {
  student_id: string;
  course_id: string;
  first_access_at: string;
};

/** Certificado emitido por (aluno, curso). */
export type CourseCertificate = {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
  full_name: string;
  pdf_file: string;
};

/** Bumps disponíveis para venda. */
export const BUMPS = [
  { id: "sobrancelha", label: "Curso de Sobrancelha", price_cents: 1000, description: "Curso de Sobrancelha (bônus)" },
  { id: "vitalicio", label: "Atualizações Vitalícias", price_cents: 900, description: "Atualizações Vitalícias (bônus)" },
  { id: "cilios", label: "Curso de Extensão de Cílios", price_cents: 1300, description: "Curso de Extensão de Cílios (bônus)" },
] as const;
export type BumpId = (typeof BUMPS)[number]["id"];

type DB = {
  certificates: Certificate[];
  admins: AdminUser[];
  template_config: TemplateConfig;
  settings: Settings;
  kiwify_buyers: KiwifyBuyer[];
  students: Student[];
  course_modules: CourseModule[];
  courses: Course[];
  course_assets: CourseAsset[];
  course_cert_configs: CourseCertConfig[];
  student_course_access: StudentCourseAccess[];
  course_certificates: CourseCertificate[];
};

const DEFAULT_DB: DB = {
  certificates: [],
  admins: [],
  template_config: {
    template_file: null,
    template_mime: null,
    photo_x: 100,
    photo_y: 100,
    photo_w: 300,
    photo_h: 300,
    name_x: 400,
    name_y: 500,
    name_font_size: 48,
    name_color: "#000000",
    date_x: 400,
    date_y: 560,
    date_font_size: 24,
    date_color: "#000000",
  },
  settings: { openai_api_key: null },
  kiwify_buyers: [],
  students: [],
  course_modules: [],
  courses: [],
  course_assets: [],
  course_cert_configs: [],
  student_course_access: [],
  course_certificates: [],
};

let writeChain: Promise<unknown> = Promise.resolve();

async function ensureDirs() {
  await fs.mkdir(FILES_DIR, { recursive: true });
}

export async function readDB(): Promise<DB> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      certificates: parsed.certificates ?? [],
      admins: parsed.admins ?? [],
      template_config: { ...DEFAULT_DB.template_config, ...(parsed.template_config ?? {}) },
      settings: { ...DEFAULT_DB.settings, ...(parsed.settings ?? {}) },
      kiwify_buyers: parsed.kiwify_buyers ?? [],
      students: (parsed.students ?? []).map((s) => ({ ...s, bumps: s.bumps ?? [] })),
      course_modules: (parsed.course_modules ?? []).map((m) => ({ ...m, required_bump: m.required_bump ?? null })),
      courses: (parsed.courses ?? []).map((c) => ({ ...c, required_bump: c.required_bump ?? null, cover_file: c.cover_file ?? null })),
      course_assets: parsed.course_assets ?? [],
      course_cert_configs: parsed.course_cert_configs ?? [],
      student_course_access: parsed.student_course_access ?? [],
      course_certificates: parsed.course_certificates ?? [],
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      return structuredClone(DEFAULT_DB);
    }
    throw e;
  }
}

export function withDB<T>(mutator: (db: DB) => Promise<T> | T): Promise<T> {
  const next = writeChain.then(async () => {
    const db = await readDB();
    const result = await mutator(db);
    const tmp = DB_PATH + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
    return result;
  });
  writeChain = next.catch(() => {});
  return next;
}

export async function saveFile(relName: string, bytes: Uint8Array): Promise<string> {
  await ensureDirs();
  const safe = relName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const full = path.join(FILES_DIR, safe);
  await fs.writeFile(full, bytes);
  return safe;
}

export async function readFileBytes(relName: string): Promise<{ bytes: Buffer; mime: string } | null> {
  const safe = relName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const full = path.join(FILES_DIR, safe);
  try {
    const bytes = await fs.readFile(full);
    const ext = path.extname(safe).toLowerCase();
    const mime =
      ext === ".pdf" ? "application/pdf" :
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".webp" ? "image/webp" :
      ext === ".mp4" ? "video/mp4" :
      ext === ".webm" ? "video/webm" :
      ext === ".mov" ? "video/quicktime" :
      ext === ".m4v" ? "video/x-m4v" :
      "application/octet-stream";
    return { bytes, mime };
  } catch {
    return null;
  }
}

export async function deleteFile(relName: string): Promise<void> {
  const safe = relName.replace(/[^a-zA-Z0-9._-]/g, "_");
  try {
    await fs.unlink(path.join(FILES_DIR, safe));
  } catch {
    /* ignore */
  }
}

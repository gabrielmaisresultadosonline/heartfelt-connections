import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDB, withDB, deleteFile, type Course, type CourseAsset } from "./store.server";
import { requireAdmin } from "./auth.server";
import { getStudentSession } from "./student-auth.server";

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `curso-${Date.now()}`;
}

export const listCoursesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const courses = [...db.courses].sort((a, b) => a.order - b.order);
  const counts = new Map<string, { videos: number; pdfs: number }>();
  for (const a of db.course_assets) {
    const c = counts.get(a.course_id) ?? { videos: 0, pdfs: 0 };
    if (a.kind === "video") c.videos++;
    else c.pdfs++;
    counts.set(a.course_id, c);
  }
  return {
    courses: courses.map((c) => ({ ...c, ...(counts.get(c.id) ?? { videos: 0, pdfs: 0 }) })),
  };
});

const saveCourseSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).default(""),
  slug: z.string().trim().max(80).default(""),
  order: z.number().int().min(0).max(9999).default(0),
  required_bump: z.enum(["sobrancelha", "vitalicio", "cilios"]).nullable().default(null),
});

export const saveCourse = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => saveCourseSchema.parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    const now = new Date().toISOString();
    const saved = await withDB(async (d) => {
      const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
      if (data.id) {
        const i = d.courses.findIndex((c) => c.id === data.id);
        if (i >= 0) {
          d.courses[i] = {
            ...d.courses[i],
            title: data.title,
            description: data.description,
            slug,
            order: data.order,
            required_bump: data.required_bump,
          };
          return d.courses[i];
        }
      }
      const c: Course = {
        id: crypto.randomUUID(),
        slug,
        title: data.title,
        description: data.description,
        cover_file: null,
        order: data.order,
        required_bump: data.required_bump,
        created_at: now,
      };
      d.courses.push(c);
      return c;
    });
    return { ok: true as const, course: saved };
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    const toDelete: string[] = [];
    let coverFile: string | null = null;
    await withDB(async (d) => {
      const course = d.courses.find((c) => c.id === data.id);
      if (course?.cover_file) coverFile = course.cover_file;
      for (const a of d.course_assets) if (a.course_id === data.id) toDelete.push(a.file_rel);
      d.courses = d.courses.filter((c) => c.id !== data.id);
      d.course_assets = d.course_assets.filter((a) => a.course_id !== data.id);
    });
    for (const f of toDelete) await deleteFile(f);
    if (coverFile) await deleteFile(coverFile);
    return { ok: true };
  });

export const listCourseAssets = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ courseId: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    const db = await readDB();
    const assets = db.course_assets
      .filter((a) => a.course_id === data.courseId)
      .sort((a, b) => a.order - b.order);
    return { assets };
  });

export const deleteCourseAsset = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    let file: string | null = null;
    await withDB(async (d) => {
      const a = d.course_assets.find((x) => x.id === data.id);
      if (a) file = a.file_rel;
      d.course_assets = d.course_assets.filter((x) => x.id !== data.id);
    });
    if (file) await deleteFile(file);
    return { ok: true };
  });

export const renameCourseAsset = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ id: z.string(), title: z.string().trim().min(1).max(200), order: z.number().int().min(0).max(9999) }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    await withDB(async (d) => {
      const a = d.course_assets.find((x) => x.id === data.id);
      if (a) { a.title = data.title; a.order = data.order; }
    });
    return { ok: true };
  });

/** Público: lista cursos + estado de cadeado para o aluno logado. */
export const listCoursesForStudent = createServerFn({ method: "GET" }).handler(async () => {
  const s = getStudentSession();
  const db = await readDB();
  const student = s ? db.students.find((x) => x.id === s.sub) : null;
  const owned = new Set<string>(student?.bumps ?? []);
  const courses = [...db.courses]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      cover_file: c.cover_file,
      required_bump: c.required_bump,
      locked: !!c.required_bump && !owned.has(c.required_bump),
    }));
  return { authenticated: !!s, courses };
});

/** Público: curso completo (aulas + PDFs) — só se aluno tem acesso. */
export const getCourseForStudent = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string() }).parse(i))
  .handler(async ({ data }) => {
    const s = getStudentSession();
    if (!s) return { ok: false as const, error: "not_auth" as const };
    const db = await readDB();
    const course = db.courses.find((c) => c.slug === data.slug);
    if (!course) return { ok: false as const, error: "not_found" as const };
    const student = db.students.find((x) => x.id === s.sub);
    const owned = new Set<string>(student?.bumps ?? []);
    if (course.required_bump && !owned.has(course.required_bump)) {
      return { ok: false as const, error: "locked" as const, required_bump: course.required_bump };
    }
    const assets: CourseAsset[] = db.course_assets
      .filter((a) => a.course_id === course.id)
      .sort((a, b) => a.order - b.order);
    // Registra primeiro acesso (base para contagem de 8 dias do certificado).
    const alreadyAccessed = db.student_course_access.some(
      (a) => a.student_id === s.sub && a.course_id === course.id,
    );
    if (!alreadyAccessed) {
      await withDB(async (d) => {
        if (!d.student_course_access.some((a) => a.student_id === s.sub && a.course_id === course.id)) {
          d.student_course_access.push({
            student_id: s.sub,
            course_id: course.id,
            first_access_at: new Date().toISOString(),
          });
        }
      });
    }
    return {
      ok: true as const,
      course: {
        id: course.id, slug: course.slug, title: course.title,
        description: course.description, cover_file: course.cover_file,
      },
      videos: assets.filter((a) => a.kind === "video"),
      pdfs: assets.filter((a) => a.kind === "pdf"),
    };
  });

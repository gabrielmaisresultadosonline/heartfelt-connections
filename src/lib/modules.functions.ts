import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDB, withDB, type CourseModule } from "./store.server";
import { requireAdmin } from "./auth.server";
import { getStudentSession } from "./student-auth.server";

export const listModulesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const db = await readDB();
  const modules = [...db.course_modules].sort((a, b) => a.order - b.order);
  return { modules };
});

export const listModulesStudent = createServerFn({ method: "GET" }).handler(async () => {
  const s = getStudentSession();
  if (!s) return { ok: false as const, error: "Não autenticado", modules: [] as CourseModule[] };
  const db = await readDB();
  const modules = [...db.course_modules].sort((a, b) => a.order - b.order);
  return { ok: true as const, modules };
});

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  video_url: z.string().trim().url().max(500),
  order: z.number().int().min(0).max(9999).default(0),
});

export const saveModule = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => moduleSchema.parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    const now = new Date().toISOString();
    const saved = await withDB(async (d) => {
      if (data.id) {
        const idx = d.course_modules.findIndex((m) => m.id === data.id);
        if (idx >= 0) {
          d.course_modules[idx] = {
            ...d.course_modules[idx],
            title: data.title,
            description: data.description,
            video_url: data.video_url,
            order: data.order,
          };
          return d.course_modules[idx];
        }
      }
      const m: CourseModule = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        video_url: data.video_url,
        order: data.order,
        created_at: now,
      };
      d.course_modules.push(m);
      return m;
    });
    return { ok: true as const, module: saved };
  });

export const deleteModule = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data }) => {
    requireAdmin();
    await withDB(async (d) => {
      d.course_modules = d.course_modules.filter((m) => m.id !== data.id);
    });
    return { ok: true };
  });

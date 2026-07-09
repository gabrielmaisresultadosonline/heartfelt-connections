import { createFileRoute } from "@tanstack/react-router";
import { getSessionFromCookie } from "@/lib/auth.server";
import { withDB, saveFile, deleteFile } from "@/lib/store.server";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const Route = createFileRoute("/api/admin/course-cover")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = getSessionFromCookie();
        if (!admin) return new Response("Unauthorized", { status: 401 });

        const form = await request.formData();
        const courseId = String(form.get("courseId") ?? "");
        const file = form.get("file");
        if (!courseId || !(file instanceof File)) {
          return new Response("Bad request", { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
          return new Response("Cover too large (max 5MB)", { status: 413 });
        }
        const ext = (file.name.match(/\.[^.]+$/)?.[0] ?? "").toLowerCase();
        if (!ALLOWED.has(ext)) {
          return new Response("Invalid image type (use JPG, PNG or WebP)", { status: 415 });
        }
        const relName = `cover-${courseId.slice(0, 8)}-${Date.now()}${ext}`;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const saved = await saveFile(relName, bytes);

        let previous: string | null = null;
        await withDB(async (d) => {
          const c = d.courses.find((x) => x.id === courseId);
          if (!c) throw new Error("course_not_found");
          previous = c.cover_file;
          c.cover_file = saved;
        }).catch(async (e) => {
          await deleteFile(saved);
          throw e;
        });
        if (previous) await deleteFile(previous);
        return Response.json({ ok: true, cover_file: saved });
      },
    },
  },
});

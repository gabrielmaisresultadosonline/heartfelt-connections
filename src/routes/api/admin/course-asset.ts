import { createFileRoute } from "@tanstack/react-router";
import { getSessionFromCookie } from "@/lib/auth.server";
import { withDB, saveFile, deleteFile, type CourseAsset } from "@/lib/store.server";

// Regex: número no início do nome (com prefixos comuns tipo "Aula 03 -")
function parseLeadingNumber(name: string): { order: number; cleanTitle: string } {
  const base = name.replace(/\.[^.]+$/, ""); // remove extensão
  const m = base.match(/^\s*(?:aula|módulo|modulo|cap[íi]tulo)?\s*[#\-_.]?\s*(\d{1,4})\s*[\-_.:)\]\s]+\s*(.*)$/i);
  if (m) {
    const order = parseInt(m[1], 10);
    const title = (m[2] || base).trim() || base;
    return { order, cleanTitle: title };
  }
  // fallback: pega o primeiro grupo de dígitos
  const m2 = base.match(/(\d{1,4})/);
  const order = m2 ? parseInt(m2[1], 10) : 9999;
  return { order, cleanTitle: base.replace(/^[\d\s\-_.]+/, "").trim() || base };
}

function extFrom(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i).toLowerCase() : "";
}

export const Route = createFileRoute("/api/admin/course-asset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = getSessionFromCookie();
        if (!admin) return new Response("Unauthorized", { status: 401 });

        const form = await request.formData();
        const courseId = String(form.get("courseId") ?? "");
        const file = form.get("file");
        const kindHint = String(form.get("kind") ?? "");
        if (!courseId || !(file instanceof File)) {
          return new Response("Bad request", { status: 400 });
        }
        if (file.size > 800 * 1024 * 1024) {
          return new Response("File too large (max 800MB)", { status: 413 });
        }
        const ext = extFrom(file.name);
        const kind: "video" | "pdf" =
          kindHint === "pdf" || kindHint === "video"
            ? (kindHint as "video" | "pdf")
            : ext === ".pdf" ? "pdf" : "video";

        const { order, cleanTitle } = parseLeadingNumber(file.name);
        const ts = Date.now();
        const rand = Math.random().toString(36).slice(2, 8);
        const relName = `course-${courseId.slice(0, 8)}-${ts}-${rand}${ext || (kind === "pdf" ? ".pdf" : ".mp4")}`;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const saved = await saveFile(relName, bytes);

        const asset: CourseAsset = {
          id: crypto.randomUUID(),
          course_id: courseId,
          kind,
          title: cleanTitle,
          file_rel: saved,
          order,
          size_bytes: file.size,
          created_at: new Date().toISOString(),
        };
        await withDB(async (d) => {
          if (!d.courses.find((c) => c.id === courseId)) throw new Error("course_not_found");
          d.course_assets.push(asset);
        }).catch(async (e) => {
          await deleteFile(saved);
          throw e;
        });

        return Response.json({ ok: true, asset });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { statFile, readFileRange, readFileBytes } from "@/lib/store.server";

async function handle(request: Request, rel: string | undefined): Promise<Response> {
  if (!rel || rel.includes("..") || rel.includes("/")) {
    return new Response("Bad path", { status: 400 });
  }
  const st = await statFile(rel);
  if (!st) return new Response("Not found", { status: 404 });

  const isHead = request.method === "HEAD";
  const rangeHeader = request.headers.get("range");

  const baseHeaders: Record<string, string> = {
    "Content-Type": st.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=31536000, immutable",
    "Content-Length": String(st.size),
  };

  if (isHead) return new Response(null, { status: 200, headers: baseHeaders });

  if (rangeHeader) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : NaN;
      let end = m[2] ? parseInt(m[2], 10) : NaN;
      if (Number.isNaN(start)) {
        // suffix: last N bytes
        const suffix = end;
        start = Math.max(0, st.size - suffix);
        end = st.size - 1;
      } else if (Number.isNaN(end)) {
        end = st.size - 1;
      }
      if (start > end || start >= st.size) {
        return new Response("Range Not Satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${st.size}` },
        });
      }
      // Cap chunk size to keep memory low and streaming smooth.
      const MAX_CHUNK = 4 * 1024 * 1024;
      if (end - start + 1 > MAX_CHUNK) end = start + MAX_CHUNK - 1;
      const chunk = await readFileRange(rel, start, end);
      if (!chunk) return new Response("Not found", { status: 404 });
      return new Response(chunk as unknown as BodyInit, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Length": String(chunk.length),
          "Content-Range": `bytes ${start}-${end}/${st.size}`,
        },
      });
    }
  }

  // No range: return full body (fallback for small files/images/pdfs).
  const full = await readFileBytes(rel);
  if (!full) return new Response("Not found", { status: 404 });
  return new Response(full.bytes as unknown as BodyInit, { status: 200, headers: baseHeaders });
}

export const Route = createFileRoute("/api/files/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handle(request, params._splat),
      HEAD: async ({ request, params }) => handle(request, params._splat),
    },
  },
});

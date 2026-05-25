import { createFileRoute } from "@tanstack/react-router";
import { readFileBytes } from "@/lib/store.server";

export const Route = createFileRoute("/api/files/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rel = params._splat;
        if (!rel || rel.includes("..") || rel.includes("/")) {
          return new Response("Bad path", { status: 400 });
        }
        const file = await readFileBytes(rel);
        if (!file) return new Response("Not found", { status: 404 });
        return new Response(file.bytes as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": file.mime,
            "Cache-Control": "private, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});

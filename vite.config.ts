import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Lovable preview/publish keeps the default Cloudflare build.
  // The VPS deploy script sets SELF_HOST_BUILD=1 to generate a Node HTTP server.
  nitro: process.env.SELF_HOST_BUILD === "1" ? { preset: "node-server" } : undefined,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    ssr: {
      noExternal: ["lucide-react", "framer-motion"]
    },
    server: {
      host: true,
      allowedHosts: [
        "belezalisoperfeito.online",
        "www.belezalisoperfeito.online",
        "mro.bio",
        "www.mro.bio",
        ".lovable.app",
        "localhost",
      ],
    },
    preview: {
      host: true,
      allowedHosts: [
        "belezalisoperfeito.online",
        "www.belezalisoperfeito.online",
        "mro.bio",
        "www.mro.bio",
      ],
    },
  }
});

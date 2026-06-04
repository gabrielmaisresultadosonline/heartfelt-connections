import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
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

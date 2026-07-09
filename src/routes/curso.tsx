import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/curso")({
  beforeLoad: () => {
    throw redirect({ to: "/cursos" });
  },
});

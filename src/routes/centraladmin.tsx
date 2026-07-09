import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/centraladmin")({
  component: CentralAdmin,
});

function CentralAdmin() {
  const nav = useNavigate();
  useEffect(() => {
    nav({ to: "/admin" });
  }, [nav]);
  return <div className="min-h-screen grid place-items-center text-pink-700">Abrindo painel...</div>;
}

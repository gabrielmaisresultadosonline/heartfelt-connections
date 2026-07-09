import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, LogOut } from "lucide-react";
import { studentLogout, studentMe } from "@/lib/students.functions";
import { listModulesStudent } from "@/lib/modules.functions";

export const Route = createFileRoute("/curso")({
  component: CoursePage,
  head: () => ({ meta: [{ title: "Meu Curso — Alisamento Perfeito" }] }),
});

function toEmbed(url: string): { type: "iframe" | "video"; src: string } {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.searchParams.get("v") || u.pathname.split("/").pop() || "";
      return { type: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop() || "";
      return { type: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }
    return { type: "video", src: url };
  } catch {
    return { type: "video", src: url };
  }
}

function CoursePage() {
  const nav = useNavigate();
  const me = useServerFn(studentMe);
  const logout = useServerFn(studentLogout);
  const listMods = useServerFn(listModulesStudent);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    me().then((r) => {
      if (!mounted) return;
      if (!r.authenticated) nav({ to: "/login" });
      else {
        setName(r.name);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [me, nav]);

  const { data } = useQuery({
    queryKey: ["student-modules"],
    queryFn: () => listMods(),
    enabled: ready,
  });

  const [active, setActive] = useState<string | null>(null);

  if (!ready) {
    return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;
  }

  const modules = data?.modules ?? [];
  const current = modules.find((m) => m.id === active) ?? modules[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0710] via-[#1a0a14] to-[#2a0a1f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/30 sticky top-0 z-30">
        <div>
          <h1 className="font-black text-lg md:text-xl">Curso de Alisamento Perfeito</h1>
          <p className="text-xs text-white/60">Bem-vinda, {name}</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            nav({ to: "/login" });
          }}
          className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_320px] gap-6">
        <div>
          {current ? (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 aspect-video">
                {(() => {
                  const e = toEmbed(current.video_url);
                  if (e.type === "iframe") {
                    return (
                      <iframe
                        src={e.src}
                        title={current.title}
                        allowFullScreen
                        allow="autoplay; encrypted-media; picture-in-picture"
                        className="w-full h-full"
                      />
                    );
                  }
                  return <video src={e.src} controls className="w-full h-full" />;
                })()}
              </div>
              <h2 className="text-2xl md:text-3xl font-black mt-6">{current.title}</h2>
              {current.description && (
                <p className="text-white/80 mt-3 leading-relaxed whitespace-pre-line">
                  {current.description}
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/70">
              Nenhuma aula publicada ainda. Volte em breve.
            </div>
          )}
        </div>

        <aside className="space-y-2">
          <h3 className="font-black text-white/90 mb-2 uppercase tracking-wider text-xs">
            Módulos ({modules.length})
          </h3>
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                (current?.id ?? modules[0]?.id) === m.id
                  ? "bg-[#d82298]/20 border-[#d82298]/50"
                  : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <PlayCircle size={22} className="text-[#ff7ac4] shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{m.title}</p>
                {m.description && (
                  <p className="text-xs text-white/50 truncate">{m.description}</p>
                )}
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}

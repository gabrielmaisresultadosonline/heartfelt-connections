import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, FileText, ArrowLeft, Lock, Download, Sparkles } from "lucide-react";
import { studentMe } from "@/lib/students.functions";
import { getCourseForStudent } from "@/lib/courses.functions";

export const Route = createFileRoute("/curso/$slug")({
  component: CourseViewer,
});

function CourseViewer() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const me = useServerFn(studentMe);
  const getCourse = useServerFn(getCourseForStudent);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"aulas" | "materiais">("aulas");
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    me().then((r) => {
      if (!m) return;
      if (!r.authenticated) nav({ to: "/login" });
      else setReady(true);
    });
    return () => { m = false; };
  }, [me, nav]);

  const { data, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => getCourse({ data: { slug } }),
    enabled: ready,
  });

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fdf2f7]">
        <div className="flex items-center gap-3 text-[#d82298]">
          <Sparkles className="animate-pulse" size={18} />
          <span className="font-semibold tracking-wide">Carregando sua aula…</span>
        </div>
      </div>
    );
  }
  if (!data || !data.ok) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center bg-[#fdf2f7]">
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-rose-100 p-10 max-w-md">
          {data?.error === "locked" ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 grid place-items-center mb-4">
                <Lock size={28} className="text-[#d82298]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>Curso bloqueado</h2>
              <p className="text-sm text-zinc-500 mt-2">Este curso precisa ser adquirido para desbloquear.</p>
              <a href="/promocc" className="mt-5 inline-block bg-[#d82298] hover:shadow-lg hover:shadow-pink-200 transition-all text-white font-semibold rounded-full px-6 py-3">Comprar agora</a>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>Curso não encontrado</h2>
              <Link to="/cursos" className="mt-4 inline-block text-[#d82298] font-semibold underline">← Voltar para meus cursos</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const { course, videos, pdfs } = data;
  const current = currentId ? videos.find((v) => v.id === currentId) ?? null : videos[0] ?? null;
  const currentIndex = current ? videos.findIndex((v) => v.id === current.id) : -1;
  const progressPct = videos.length > 0 ? Math.round(((currentIndex + 1) / videos.length) * 100) : 0;

  return (
    <div
      className="min-h-screen w-full bg-[#fdf2f7] py-4 md:py-8 lg:py-10 px-4 md:px-8 lg:px-12 flex flex-col items-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="max-w-7xl w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <Link
          to="/cursos"
          className="inline-flex items-center text-[#d82298] font-medium gap-2 group text-sm md:text-base hover:gap-3 transition-all duration-300"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Meus cursos
        </Link>
        <h1
          className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight text-center truncate"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {course.title}
        </h1>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-32 h-1.5 bg-rose-200 rounded-full overflow-hidden">
            <div className="bg-[#d82298] h-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-semibold text-[#d82298] whitespace-nowrap">{progressPct}%</span>
        </div>
      </div>

      {/* Main dashboard */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Player + detail */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#d82298]/10 blur-3xl rounded-[2.5rem] opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              {current ? (
                <video
                  key={current.id}
                  src={`/api/files/${current.file_rel}`}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload"
                  className="w-full h-full"
                  poster={course.cover_file ? `/api/files/${course.cover_file}` : undefined}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  Nenhum vídeo neste curso ainda.
                </div>
              )}
            </div>
          </div>

          {current && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-rose-100 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <PlayCircle size={96} className="text-[#d82298]" />
              </div>
              <span className="inline-block text-[#d82298] font-bold text-xs tracking-widest uppercase mb-2">
                Aula #{current.order || currentIndex + 1}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-zinc-800 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {current.title}
              </h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {currentIndex < videos.length - 1 && (
                  <button
                    onClick={() => setCurrentId(videos[currentIndex + 1].id)}
                    className="px-6 py-2.5 bg-[#d82298] text-white rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-pink-200 transition-all"
                  >
                    Próxima aula →
                  </button>
                )}
                {pdfs.length > 0 && (
                  <button
                    onClick={() => setTab("materiais")}
                    className="px-6 py-2.5 border border-rose-200 text-[#d82298] rounded-full font-semibold text-sm hover:bg-rose-50 transition-all"
                  >
                    Ver materiais PDF
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white flex flex-col max-h-[85vh] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-rose-50 p-2 gap-2">
              <button
                onClick={() => setTab("aulas")}
                className={`flex-1 py-3.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                  tab === "aulas"
                    ? "bg-rose-50 text-[#d82298] border border-rose-100"
                    : "text-zinc-400 hover:text-rose-400"
                }`}
              >
                <PlayCircle size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Aulas ({videos.length})</span>
              </button>
              <button
                onClick={() => setTab("materiais")}
                className={`flex-1 py-3.5 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                  tab === "materiais"
                    ? "bg-rose-50 text-[#d82298] border border-rose-100"
                    : "text-zinc-400 hover:text-rose-400"
                }`}
              >
                <FileText size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Materiais ({pdfs.length})</span>
              </button>
            </div>

            <div className="overflow-y-auto custom-pink-scroll p-4 space-y-3">
              {tab === "aulas" ? (
                videos.length === 0 ? (
                  <p className="p-8 text-center text-sm text-zinc-400">Sem aulas.</p>
                ) : (
                  videos.map((v, idx) => {
                    const active = current?.id === v.id;
                    const label = String(v.order || idx + 1).padStart(2, "0");
                    return (
                      <button
                        key={v.id}
                        onClick={() => setCurrentId(v.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group border ${
                          active
                            ? "bg-gradient-to-br from-[#d82298] to-[#f43f5e] text-white shadow-lg shadow-pink-200/50 border-transparent"
                            : "hover:bg-rose-50 border-transparent hover:border-rose-100"
                        }`}
                        style={{ animation: `fade-in .4s ease-out both`, animationDelay: `${idx * 40}ms` }}
                      >
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-transform ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-rose-100 text-[#d82298] group-hover:scale-105"
                          }`}
                        >
                          #{label}
                        </div>
                        <div className="flex-1 min-w-0">
                          {active && (
                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">
                              Tocando agora
                            </p>
                          )}
                          <h4 className={`text-sm font-semibold leading-snug truncate ${active ? "text-white" : "text-zinc-700"}`}>
                            {v.title}
                          </h4>
                          {!active && (
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Pendente</p>
                          )}
                        </div>
                        {active ? (
                          <div className="relative flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            <div className="absolute w-2 h-2 bg-white rounded-full" />
                          </div>
                        ) : (
                          <PlayCircle
                            size={22}
                            className="text-zinc-300 group-hover:text-[#d82298] transition-colors flex-shrink-0"
                          />
                        )}
                      </button>
                    );
                  })
                )
              ) : pdfs.length === 0 ? (
                <p className="p-8 text-center text-sm text-zinc-400">Sem materiais.</p>
              ) : (
                pdfs.map((p, idx) => {
                  const label = String(p.order || idx + 1).padStart(2, "0");
                  return (
                    <a
                      key={p.id}
                      href={`/api/files/${p.file_rel}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 group"
                      style={{ animation: `fade-in .4s ease-out both`, animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-100 text-[#d82298] flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
                        #{label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-700 leading-snug truncate">{p.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">PDF • Baixar</p>
                      </div>
                      <Download size={18} className="text-zinc-300 group-hover:text-[#d82298] transition-colors flex-shrink-0" />
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Mobile progress */}
          <div className="md:hidden mt-4 flex items-center gap-2 px-2">
            <div className="flex-1 h-1.5 bg-rose-200 rounded-full overflow-hidden">
              <div className="bg-[#d82298] h-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-semibold text-[#d82298]">{progressPct}%</span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-pink-scroll::-webkit-scrollbar { width: 6px; }
        .custom-pink-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-pink-scroll::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
        .custom-pink-scroll::-webkit-scrollbar-thumb:hover { background: #d82298; }
      `}</style>
    </div>
  );
}

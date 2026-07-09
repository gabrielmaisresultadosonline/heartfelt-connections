import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, FileText, ArrowLeft, Lock, Download } from "lucide-react";
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

  if (!ready || isLoading) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;
  if (!data || !data.ok) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center bg-gradient-to-br from-rose-50 to-fuchsia-50">
        <div className="bg-white rounded-2xl shadow ring-1 ring-pink-100 p-8 max-w-md">
          {data?.error === "locked" ? (
            <>
              <Lock size={40} className="mx-auto text-pink-600 mb-3" />
              <h2 className="text-2xl font-black text-gray-900">Curso bloqueado</h2>
              <p className="text-sm text-gray-500 mt-2">Este curso precisa ser adquirido para ser desbloqueado.</p>
              <a href="/promocc" className="mt-4 inline-block bg-[#d82298] hover:bg-[#b8127f] text-white font-bold rounded-full px-6 py-3">Comprar</a>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-900">Curso não encontrado</h2>
              <Link to="/cursos" className="mt-4 inline-block text-pink-700 font-bold underline">← Voltar para meus cursos</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const { course, videos, pdfs } = data;
  const current = currentId ? videos.find((v) => v.id === currentId) ?? null : videos[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <header className="bg-white/70 backdrop-blur border-b border-pink-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/cursos" className="inline-flex items-center gap-1 text-sm font-semibold text-pink-700 hover:text-pink-900">
            <ArrowLeft size={16} /> Meus cursos
          </Link>
          <h1 className="font-black text-gray-900 truncate">{course.title}</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Player */}
        <div>
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
            {current ? (
              <video
                key={current.id}
                src={`/api/files/${current.file_rel}`}
                controls
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
          {current && (
            <div className="mt-4 bg-white rounded-2xl ring-1 ring-pink-100 p-4">
              <p className="text-xs text-gray-400 font-mono">Aula #{current.order}</p>
              <h2 className="text-xl font-black text-gray-900">{current.title}</h2>
            </div>
          )}
        </div>

        {/* Lista lateral com abas */}
        <aside className="bg-white rounded-2xl ring-1 ring-pink-100 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex border-b border-pink-100">
            <button
              onClick={() => setTab("aulas")}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 ${
                tab === "aulas" ? "text-[#d82298] border-b-2 border-[#d82298] bg-pink-50/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PlayCircle size={14} /> Aulas ({videos.length})
            </button>
            <button
              onClick={() => setTab("materiais")}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 ${
                tab === "materiais" ? "text-[#d82298] border-b-2 border-[#d82298] bg-pink-50/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText size={14} /> Materiais ({pdfs.length})
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {tab === "aulas" ? (
              videos.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">Sem aulas.</p>
              ) : (
                <ul>
                  {videos.map((v) => (
                    <li key={v.id}>
                      <button
                        onClick={() => setCurrentId(v.id)}
                        className={`w-full text-left px-4 py-3 border-b border-pink-50 flex items-center gap-3 hover:bg-pink-50/50 transition ${
                          current?.id === v.id ? "bg-pink-50" : ""
                        }`}
                      >
                        <span className="text-xs font-mono text-gray-400 w-8">#{v.order}</span>
                        <PlayCircle size={16} className={current?.id === v.id ? "text-[#d82298]" : "text-gray-400"} />
                        <span className="flex-1 text-sm font-medium truncate">{v.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              pdfs.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">Sem materiais.</p>
              ) : (
                <ul>
                  {pdfs.map((p) => (
                    <li key={p.id}>
                      <a
                        href={`/api/files/${p.file_rel}`}
                        target="_blank" rel="noreferrer"
                        className="w-full text-left px-4 py-3 border-b border-pink-50 flex items-center gap-3 hover:bg-pink-50/50 transition"
                      >
                        <span className="text-xs font-mono text-gray-400 w-8">#{p.order}</span>
                        <FileText size={16} className="text-pink-600" />
                        <span className="flex-1 text-sm font-medium truncate">{p.title}</span>
                        <Download size={14} className="text-gray-400" />
                      </a>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

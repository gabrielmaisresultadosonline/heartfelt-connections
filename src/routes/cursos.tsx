import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, PlayCircle, LogOut, BookOpen } from "lucide-react";
import { studentLogout, studentMe } from "@/lib/students.functions";
import { listCoursesForStudent } from "@/lib/courses.functions";

export const Route = createFileRoute("/cursos")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Meus Cursos — Área de Membros" }] }),
});

function CoursesPage() {
  const nav = useNavigate();
  const me = useServerFn(studentMe);
  const logout = useServerFn(studentLogout);
  const listFn = useServerFn(listCoursesForStudent);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let m = true;
    me().then((r) => {
      if (!m) return;
      if (!r.authenticated) nav({ to: "/login" });
      else { setName(r.name); setReady(true); }
    });
    return () => { m = false; };
  }, [me, nav]);

  const { data } = useQuery({
    queryKey: ["student-courses"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;
  const courses = data?.courses ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <header className="bg-white/70 backdrop-blur border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#d82298]">Área de Membros</h1>
            <p className="text-xs text-gray-500">Olá, {name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/meus-certificados"
              className="text-sm inline-flex items-center gap-1 text-pink-700 hover:text-pink-900 font-bold"
            >
              🏆 Certificados
            </Link>
            <button
              onClick={async () => { await logout(); nav({ to: "/login" }); }}
              className="text-sm inline-flex items-center gap-1 text-pink-700 hover:text-pink-900 font-semibold"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-black mb-6 text-gray-900">Meus cursos</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">Nenhum curso disponível ainda.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl overflow-hidden ring-1 ring-pink-100 shadow-sm hover:shadow-lg transition group relative">
                <div className="aspect-video bg-pink-100 relative overflow-hidden">
                  {c.cover_file ? (
                    <img src={`/api/files/${c.cover_file}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pink-300"><BookOpen size={48} /></div>
                  )}
                  {c.locked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                      <Lock size={36} className="mb-2" />
                      <p className="text-sm font-bold">Curso bloqueado</p>
                      <p className="text-xs opacity-80 mt-1">Compre para desbloquear</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black text-lg text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description || "\u00A0"}</p>
                  {c.locked ? (
                    <a href="/promocc" className="mt-3 block text-center bg-gray-900 hover:bg-black text-white font-bold rounded-full py-2.5 text-sm">
                      Comprar para liberar
                    </a>
                  ) : (
                    <Link to="/curso/$slug" params={{ slug: c.slug }} className="mt-3 flex items-center justify-center gap-2 bg-[#d82298] hover:bg-[#b8127f] text-white font-bold rounded-full py-2.5 text-sm">
                      <PlayCircle size={16} /> Acessar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

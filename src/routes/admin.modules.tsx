import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import { deleteModule, listModulesAdmin, saveModule } from "@/lib/modules.functions";

export const Route = createFileRoute("/admin/modules")({
  component: ModulesPage,
});

function ModulesPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const listFn = useServerFn(listModulesAdmin);
  const saveFn = useServerFn(saveModule);
  const delFn = useServerFn(deleteModule);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<{
    id?: string; title: string; description: string; video_url: string; order: number; required_bump: "sobrancelha" | "vitalicio" | null;
  }>({ title: "", description: "", video_url: "", order: 0, required_bump: null });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    me().then((r) => {
      if (!m) return;
      if (!r.authenticated) nav({ to: "/admin/login" });
      else setReady(true);
    });
    return () => { m = false; };
  }, [me, nav]);

  const { data } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;
  const mods = data?.modules ?? [];

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const r = await saveFn({ data: editing });
      if (r.ok) {
        setMsg(editing.id ? "✓ Módulo atualizado" : "✓ Módulo criado");
        setEditing({ title: "", description: "", video_url: "", order: (mods.at(-1)?.order ?? -1) + 1, required_bump: null });
        qc.invalidateQueries({ queryKey: ["admin-modules"] });
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Módulos do Curso
            </h1>
            <p className="text-sm text-rose-900/60 mt-1">Título + URL do vídeo (YouTube, Vimeo ou MP4).</p>
          </div>
          <nav className="flex gap-3 text-sm font-semibold">
            <a href="/admin" className="text-pink-700 hover:text-pink-900">Dashboard</a>
            <a href="/admin/students" className="text-pink-700 hover:text-pink-900">Alunos</a>
            <a href="/admin/settings" className="text-pink-700 hover:text-pink-900">Configurações</a>
          </nav>
        </div>

        <form onSubmit={onSave} className="bg-white rounded-2xl shadow ring-1 ring-pink-100 p-5 mb-6 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-gray-600">Título</label>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required maxLength={200}
              className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-600">URL do vídeo</label>
            <input value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
              required type="url" placeholder="https://youtu.be/..."
              className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-600">Ordem</label>
            <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
              className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase text-gray-600">Descrição (opcional)</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
              className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            {msg && <span className="text-sm text-green-700">{msg}</span>}
            <div className="flex gap-2 ml-auto">
              {editing.id && (
                <button type="button" onClick={() => setEditing({ title: "", description: "", video_url: "", order: 0 })}
                  className="px-4 py-2 text-sm font-bold rounded-full bg-gray-100 hover:bg-gray-200">
                  Cancelar edição
                </button>
              )}
              <button type="submit" className="px-6 py-2 text-sm font-bold rounded-full bg-[#d82298] hover:bg-[#b8127f] text-white shadow">
                {editing.id ? "Salvar alterações" : "Adicionar módulo"}
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow ring-1 ring-pink-100 overflow-hidden">
          {mods.length === 0 ? (
            <div className="p-10 text-center text-rose-700/60">Nenhum módulo cadastrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-pink-50 text-left text-rose-900">
                <tr>
                  <th className="p-3 font-semibold w-16">#</th>
                  <th className="p-3 font-semibold">Título</th>
                  <th className="p-3 font-semibold">Vídeo</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {mods.map((m) => (
                  <tr key={m.id} className="border-t border-pink-100 hover:bg-pink-50/40">
                    <td className="p-3 text-xs text-gray-600">{m.order}</td>
                    <td className="p-3 font-medium">{m.title}</td>
                    <td className="p-3 text-xs">
                      <a href={m.video_url} target="_blank" rel="noreferrer" className="text-pink-700 underline break-all">
                        {m.video_url}
                      </a>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setEditing({ id: m.id, title: m.title, description: m.description, video_url: m.video_url, order: m.order })}
                        className="text-xs font-bold text-pink-700 hover:underline">Editar</button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Apagar módulo "${m.title}"?`)) return;
                          await delFn({ data: { id: m.id } });
                          qc.invalidateQueries({ queryKey: ["admin-modules"] });
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline">Apagar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

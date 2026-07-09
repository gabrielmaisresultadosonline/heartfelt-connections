import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import {
  listCoursesAdmin, saveCourse, deleteCourse,
  listCourseAssets, deleteCourseAsset, renameCourseAsset,
} from "@/lib/courses.functions";
import { FileVideo, FileText, Upload, Trash2, Image as ImageIcon, Loader2, Plus, Pencil, Save, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/courses")({
  component: CoursesAdmin,
});

type BumpId = "sobrancelha" | "vitalicio" | "cilios" | null;

type UploadItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

function CoursesAdmin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const listFn = useServerFn(listCoursesAdmin);
  const saveFn = useServerFn(saveCourse);
  const delFn = useServerFn(deleteCourse);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ id?: string; title: string; description: string; slug: string; order: number; required_bump: BumpId }>({
    title: "", description: "", slug: "", order: 0, required_bump: null,
  });

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
    queryKey: ["admin-courses"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  const courses = data?.courses ?? [];
  const selected = courses.find((c) => c.id === selectedId) ?? null;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const r = await saveFn({ data: form });
    if (r.ok) {
      setShowForm(false);
      setForm({ title: "", description: "", slug: "", order: 0, required_bump: null });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Apagar o curso "${title}" e TODOS os vídeos/PDFs?`)) return;
    await delFn({ data: { id } });
    if (selectedId === id) setSelectedId(null);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Cursos
            </h1>
            <p className="text-sm text-rose-900/60 mt-1">
              Crie cursos, envie a capa e faça upload em lote dos vídeos e PDFs. Os arquivos são ordenados pelo número no início do nome (ex: <code>01 - Introdução.mp4</code>).
            </p>
          </div>
          <nav className="flex gap-3 text-sm font-semibold">
            <a href="/admin" className="text-pink-700 hover:text-pink-900">Dashboard</a>
            <a href="/admin/students" className="text-pink-700 hover:text-pink-900">Alunos</a>
            <a href="/admin/modules" className="text-pink-700 hover:text-pink-900">Módulos (legado)</a>
          </nav>
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-6">
          {/* Lista de cursos */}
          <div className="space-y-3">
            <button
              onClick={() => { setForm({ title: "", description: "", slug: "", order: courses.length, required_bump: null }); setShowForm(true); }}
              className="w-full flex items-center justify-center gap-2 bg-[#d82298] hover:bg-[#b8127f] text-white font-bold rounded-2xl py-3 shadow"
            >
              <Plus size={18} /> Novo curso
            </button>
            {courses.length === 0 && (
              <div className="p-6 text-center text-rose-700/60 bg-white rounded-2xl ring-1 ring-pink-100">
                Nenhum curso ainda.
              </div>
            )}
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left bg-white rounded-2xl ring-1 p-3 flex gap-3 items-center transition ${
                  selectedId === c.id ? "ring-2 ring-pink-500 shadow-lg" : "ring-pink-100 hover:ring-pink-300"
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-pink-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {c.cover_file
                    ? <img src={`/api/files/${c.cover_file}`} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon className="text-pink-400" size={22} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{c.title}</div>
                  <div className="text-[11px] text-gray-500">
                    {c.videos} vídeo{c.videos === 1 ? "" : "s"} · {c.pdfs} PDF{c.pdfs === 1 ? "" : "s"}
                    {c.required_bump && <span className="ml-1 text-amber-700 font-bold">· bump: {c.required_bump}</span>}
                  </div>
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); setForm({ id: c.id, title: c.title, description: c.description, slug: c.slug, order: c.order, required_bump: c.required_bump as BumpId }); setShowForm(true); }}
                  className="text-pink-600 hover:text-pink-800 p-1"
                  role="button"
                  tabIndex={0}
                ><Pencil size={16} /></span>
                <span
                  onClick={(e) => { e.stopPropagation(); onDelete(c.id, c.title); }}
                  className="text-red-500 hover:text-red-700 p-1"
                  role="button"
                  tabIndex={0}
                ><Trash2 size={16} /></span>
              </button>
            ))}
          </div>

          {/* Detalhe do curso */}
          <div>
            {selected ? (
              <CourseDetail courseId={selected.id} courseTitle={selected.title} coverFile={selected.cover_file} slug={selected.slug} onCoverUpdated={() => qc.invalidateQueries({ queryKey: ["admin-courses"] })} />
            ) : (
              <div className="bg-white rounded-2xl ring-1 ring-pink-100 p-10 text-center text-rose-700/60">
                Selecione um curso ao lado para gerenciar capa, aulas e PDFs.
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={onSave}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 grid gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#d82298]">{form.id ? "Editar curso" : "Novo curso"}</h3>
                <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-600">Título</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required maxLength={160}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-600">Slug (URL) — opcional</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="alisamento-perfeito"
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600">Ordem</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600">Acesso</label>
                  <select
                    value={form.required_bump ?? ""}
                    onChange={(e) => setForm({ ...form, required_bump: (e.target.value || null) as BumpId })}
                    className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="">Curso base (todos)</option>
                    <option value="sobrancelha">Bump: Sobrancelha</option>
                    <option value="vitalicio">Bump: Vitalícias</option>
                    <option value="cilios">Bump: Cílios</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-600">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
              <button type="submit" className="mt-2 bg-[#d82298] hover:bg-[#b8127f] text-white font-bold rounded-full py-3">
                <Save size={16} className="inline mr-1" /> Salvar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseDetail({
  courseId, courseTitle, coverFile, slug, onCoverUpdated,
}: { courseId: string; courseTitle: string; coverFile: string | null; slug: string; onCoverUpdated: () => void }) {
  const qc = useQueryClient();
  const listAssets = useServerFn(listCourseAssets);
  const delAsset = useServerFn(deleteCourseAsset);
  const renameAsset = useServerFn(renameCourseAsset);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const queueRef = useRef<UploadItem[]>([]);
  queueRef.current = queue;
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<{ id: string; title: string; order: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const retryInputRef = useRef<HTMLInputElement>(null);
  const retryTargetRef = useRef<string | null>(null);

  const { data } = useQuery({
    queryKey: ["course-assets", courseId],
    queryFn: () => listAssets({ data: { courseId } }),
  });
  const videos = (data?.assets ?? []).filter((a) => a.kind === "video");
  const pdfs = (data?.assets ?? []).filter((a) => a.kind === "pdf");

  function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const items: UploadItem[] = Array.from(files)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
      .map((f) => ({ id: crypto.randomUUID(), file: f, status: "queued" }));
    setQueue((q) => [...q, ...items]);
  }

  async function processQueue() {
    if (uploading) return;
    setUploading(true);
    // upload sequencial — sempre lê a fila mais atual (permite retries no meio)
    while (true) {
      const item = queueRef.current.find((x) => x.status === "queued");
      if (!item) break;
      setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "uploading", error: undefined } : x));
      const form = new FormData();
      form.append("courseId", courseId);
      form.append("file", item.file);
      form.append("kind", item.file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(item.file.name) ? "video" : "pdf");
      try {
        const res = await fetch("/api/admin/course-asset", { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text());
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "done" } : x));
      } catch (e) {
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "error", error: e instanceof Error ? e.message : "erro" } : x));
      }
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["course-assets", courseId] });
    // limpa concluídos
    setTimeout(() => setQueue((q) => q.filter((x) => x.status !== "done")), 1500);
  }

  function retrySame(id: string) {
    setQueue((q) => q.map((x) => x.id === id ? { ...x, status: "queued", error: undefined } : x));
    setTimeout(() => { void processQueue(); }, 0);
  }

  function retryWithReplace(id: string) {
    retryTargetRef.current = id;
    retryInputRef.current?.click();
  }

  function onRetryFilePicked(file: File | undefined) {
    const id = retryTargetRef.current;
    retryTargetRef.current = null;
    if (retryInputRef.current) retryInputRef.current.value = "";
    if (!id || !file) return;
    setQueue((q) => q.map((x) => x.id === id ? { ...x, file, status: "queued", error: undefined } : x));
    setTimeout(() => { void processQueue(); }, 0);
  }

  async function uploadCover(f: File) {
    setCoverUploading(true);
    try {
      const form = new FormData();
      form.append("courseId", courseId);
      form.append("file", f);
      const res = await fetch("/api/admin/course-cover", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      onCoverUpdated();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setCoverUploading(false);
    }
  }

  async function onDeleteAsset(id: string, title: string) {
    if (!confirm(`Apagar "${title}"?`)) return;
    await delAsset({ data: { id } });
    qc.invalidateQueries({ queryKey: ["course-assets", courseId] });
  }

  async function saveEdit() {
    if (!editingAsset) return;
    await renameAsset({ data: editingAsset });
    setEditingAsset(null);
    qc.invalidateQueries({ queryKey: ["course-assets", courseId] });
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl ring-1 ring-pink-100 p-5">
        <div className="flex items-start gap-4">
          <div className="w-40 aspect-video rounded-xl bg-pink-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {coverFile
              ? <img src={`/api/files/${coverFile}`} alt="capa" className="w-full h-full object-cover" />
              : <ImageIcon className="text-pink-400" size={32} />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900 truncate">{courseTitle}</h2>
            <p className="text-xs text-gray-500 mt-1">
              URL pública: <a href={`/curso/${slug}`} target="_blank" rel="noreferrer" className="text-pink-700 underline">/curso/{slug}</a>
            </p>
            <div className="mt-3">
              <input
                ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="inline-flex items-center gap-2 text-sm bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold px-4 py-2 rounded-full"
              >
                {coverUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                {coverFile ? "Trocar capa" : "Enviar capa"}
              </button>
              <p className="text-[11px] text-gray-500 mt-2">
                <strong>Melhor formato:</strong> 1280×720px (16:9), JPG ou WebP, até 500KB. PNG só se precisar de transparência. Max 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-pink-100 p-5">
        <h3 className="text-lg font-black text-gray-900 mb-2">Upload em lote — vídeos e PDFs</h3>
        <p className="text-xs text-gray-500 mb-3">
          Selecione vários arquivos de uma vez. A ordem é lida do número no início do nome
          (ex: <code>01 - Introdução.mp4</code>, <code>02 - Passo a passo.mp4</code>).
          O upload é feito um por um automaticamente.
        </p>
        <input
          ref={fileInputRef} type="file" multiple
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,application/pdf"
          className="hidden"
          onChange={(e) => { onPick(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ""; }}
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-[#d82298] hover:bg-[#b8127f] text-white font-bold px-5 py-2.5 rounded-full"
          >
            <Plus size={16} /> Escolher arquivos
          </button>
          <button
            onClick={processQueue}
            disabled={uploading || queue.filter((q) => q.status === "queued").length === 0}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-full"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            Enviar {queue.filter((q) => q.status === "queued").length} arquivo(s)
          </button>
          {queue.length > 0 && (
            <button onClick={() => setQueue([])} className="text-sm text-gray-500 hover:text-gray-700 px-3">
              Limpar fila
            </button>
          )}
        </div>

        <input
          ref={retryInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,application/pdf"
          className="hidden"
          onChange={(e) => onRetryFilePicked(e.target.files?.[0])}
        />

        {queue.length > 0 && (
          <ul className="mt-4 space-y-1.5 max-h-64 overflow-auto text-sm">
            {queue.map((q) => (
              <li key={q.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-50/60">
                {q.status === "uploading" && <Loader2 className="animate-spin text-pink-600 flex-shrink-0" size={14} />}
                {q.status === "done" && <span className="text-green-600 flex-shrink-0">✓</span>}
                {q.status === "error" && <span className="text-red-600 flex-shrink-0">✕</span>}
                {q.status === "queued" && <span className="text-gray-400 flex-shrink-0">•</span>}
                <span className="truncate flex-1">{q.file.name}</span>
                <span className="text-xs text-gray-500">{(q.file.size / 1024 / 1024).toFixed(1)}MB</span>
                {q.error && <span className="text-xs text-red-600 truncate max-w-[160px]" title={q.error}>{q.error.slice(0, 40)}</span>}
                {q.status === "error" && (
                  <>
                    <button
                      onClick={() => retrySame(q.id)}
                      disabled={uploading}
                      className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-2.5 py-1 rounded-full"
                      title="Tentar novamente com o mesmo arquivo"
                    >
                      <RefreshCw size={11} /> Tentar
                    </button>
                    <button
                      onClick={() => retryWithReplace(q.id)}
                      disabled={uploading}
                      className="inline-flex items-center gap-1 text-xs bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold px-2.5 py-1 rounded-full"
                      title="Selecionar arquivo novamente"
                    >
                      <Upload size={11} /> Reenviar
                    </button>
                  </>
                )}
                {(q.status === "error" || q.status === "done") && (
                  <button
                    onClick={() => setQueue((qq) => qq.filter((x) => x.id !== q.id))}
                    className="text-gray-400 hover:text-gray-600"
                    title="Remover"
                  >
                    <X size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AssetSection
        title={`Aulas em vídeo (${videos.length})`}
        icon={<FileVideo size={16} />}
        assets={videos}
        onEdit={(a) => setEditingAsset({ id: a.id, title: a.title, order: a.order })}
        onDelete={(a) => onDeleteAsset(a.id, a.title)}
      />
      <AssetSection
        title={`Materiais / PDFs (${pdfs.length})`}
        icon={<FileText size={16} />}
        assets={pdfs}
        onEdit={(a) => setEditingAsset({ id: a.id, title: a.title, order: a.order })}
        onDelete={(a) => onDeleteAsset(a.id, a.title)}
      />

      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditingAsset(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 grid gap-3">
            <h3 className="text-lg font-black text-[#d82298]">Editar aula/material</h3>
            <label className="text-xs font-bold uppercase text-gray-600">Título</label>
            <input value={editingAsset.title} onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })}
              className="border border-pink-200 rounded-xl px-3 py-2" />
            <label className="text-xs font-bold uppercase text-gray-600">Ordem</label>
            <input type="number" value={editingAsset.order} onChange={(e) => setEditingAsset({ ...editingAsset, order: Number(e.target.value) })}
              className="border border-pink-200 rounded-xl px-3 py-2" />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditingAsset(null)} className="flex-1 py-2 rounded-full bg-gray-100 font-bold">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 py-2 rounded-full bg-[#d82298] text-white font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetSection({ title, icon, assets, onEdit, onDelete }: {
  title: string; icon: React.ReactNode;
  assets: { id: string; title: string; order: number; size_bytes: number; file_rel: string; kind: string }[];
  onEdit: (a: { id: string; title: string; order: number }) => void;
  onDelete: (a: { id: string; title: string }) => void;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-pink-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-pink-100 flex items-center gap-2 font-bold text-gray-800 bg-pink-50/50">
        {icon} {title}
      </div>
      {assets.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">Vazio.</div>
      ) : (
        <ul>
          {assets.map((a) => (
            <li key={a.id} className="px-5 py-3 border-t border-pink-50 first:border-0 flex items-center gap-3 hover:bg-pink-50/30">
              <span className="text-xs font-mono text-gray-400 w-8">#{a.order}</span>
              <span className="flex-1 truncate text-sm">{a.title}</span>
              <span className="text-xs text-gray-500">{(a.size_bytes / 1024 / 1024).toFixed(1)}MB</span>
              <a href={`/api/files/${a.file_rel}`} target="_blank" rel="noreferrer" className="text-xs text-pink-700 hover:underline">abrir</a>
              <button onClick={() => onEdit(a)} className="text-pink-600 hover:text-pink-800"><Pencil size={14} /></button>
              <button onClick={() => onDelete(a)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

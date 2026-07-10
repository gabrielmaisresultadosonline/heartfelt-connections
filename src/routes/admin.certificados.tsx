import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import {
  listCourseCertConfigs,
  updateCourseCertConfig,
} from "@/lib/course-certificates.functions";

export const Route = createFileRoute("/admin/certificados")({
  component: AdminCertificatesConfigPage,
});

type Cfg = {
  template_file: string | null;
  template_mime: string | null;
  photo_x: number;
  photo_y: number;
  photo_w: number;
  photo_h: number;
  name_x: number;
  name_y: number;
  name_font_size: number;
  name_color: string;
  date_x: number;
  date_y: number;
  date_font_size: number;
  date_color: string;
};

function fileToB64(file: File): Promise<{ b64: string; mime: string; ext: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf(",");
      resolve({
        b64: i >= 0 ? s.slice(i + 1) : s,
        mime: file.type,
        ext: (file.name.split(".").pop() || "bin").toLowerCase(),
      });
    };
    r.onerror = () => reject(new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}

function CourseCertForm({
  courseId,
  title,
  initial,
  templateUrl,
  hasOverride,
}: {
  courseId: string;
  title: string;
  initial: Cfg;
  templateUrl: string | null;
  hasOverride: boolean;
}) {
  const qc = useQueryClient();
  const save = useServerFn(updateCourseCertConfig);
  const [f, setF] = useState<Cfg>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setF(initial), [initial]);

  // preview URL: novo arquivo (não salvo) OU template atual
  const [previewUrl, setPreviewUrl] = useState<string | null>(templateUrl);
  const [isPdf, setIsPdf] = useState<boolean>(
    !!(templateUrl && templateUrl.toLowerCase().endsWith(".pdf")),
  );
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsPdf(file.type === "application/pdf");
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(templateUrl);
    setIsPdf(!!(templateUrl && templateUrl.toLowerCase().endsWith(".pdf")));
  }, [file, templateUrl]);

  const [tplSize, setTplSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    setTplSize(null);
    if (!previewUrl || isPdf) return;
    const img = new Image();
    img.onload = () => setTplSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = previewUrl;
  }, [previewUrl, isPdf]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageW, setStageW] = useState(600);
  useEffect(() => {
    const update = () => {
      if (stageRef.current) setStageW(Math.min(stageRef.current.clientWidth, 900));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const scale = useMemo(() => (tplSize ? stageW / tplSize.w : 1), [tplSize, stageW]);
  const stageH = useMemo(() => (tplSize ? tplSize.h * scale : 0), [tplSize, scale]);


  function upd<K extends keyof Cfg>(k: K, v: Cfg[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      let templateBase64: string | null = null;
      let templateMime: string | null = null;
      let templateExt: string | null = null;
      if (file) {
        const r = await fileToB64(file);
        templateBase64 = r.b64;
        templateMime = r.mime;
        templateExt = r.ext;
      }
      await save({
        data: {
          courseId,
          photo_x: f.photo_x,
          photo_y: f.photo_y,
          photo_w: f.photo_w,
          photo_h: f.photo_h,
          name_x: f.name_x,
          name_y: f.name_y,
          name_font_size: f.name_font_size,
          name_color: f.name_color,
          date_x: f.date_x,
          date_y: f.date_y,
          date_font_size: f.date_font_size,
          date_color: f.date_color,
          templateBase64,
          templateMime,
          templateExt,
        },
      });
      setMsg("✓ Salvo");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["admin-cert-configs"] });
    } catch (e2) {
      setMsg(e2 instanceof Error ? e2.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  const fields: Array<[keyof Cfg, string, string]> = [
    ["photo_x", "Foto X", "number"],
    ["photo_y", "Foto Y", "number"],
    ["photo_w", "Foto Largura", "number"],
    ["photo_h", "Foto Altura", "number"],
    ["name_x", "Nome X (centro)", "number"],
    ["name_y", "Nome Y", "number"],
    ["name_font_size", "Nome Tamanho", "number"],
    ["date_x", "Data X (centro)", "number"],
    ["date_y", "Data Y", "number"],
    ["date_font_size", "Data Tamanho", "number"],
  ];

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow border border-pink-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-pink-800">{title}</h3>
        {hasOverride ? (
          <span className="text-[11px] bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">Personalizado</span>
        ) : (
          <span className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">Usa template global</span>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-rose-900">Template do certificado (PDF ou PNG/JPG)</label>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full mt-1 text-xs"
        />
        {templateUrl && (
          <a href={templateUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-700 underline">
            Ver atual
          </a>
        )}
      </div>

      {/* Preview ao vivo */}
      <div>
        <p className="text-xs font-bold text-rose-900 mb-2">
          Preview {file ? "(novo template — ainda não salvo)" : "(template atual)"}
        </p>
        <div ref={stageRef} className="bg-white rounded-xl border border-pink-100 overflow-hidden">
          {previewUrl && isPdf ? (
            <div className="p-6 text-center text-xs text-rose-900/70">
              PDF não tem preview interativo — ajuste os números e salve para testar.
            </div>
          ) : previewUrl && tplSize ? (
            <div className="relative bg-white mx-auto" style={{ width: stageW, height: stageH }}>
              <div
                className="absolute border-2 border-dashed border-amber-500 bg-amber-100/40 flex items-center justify-center text-[10px] text-amber-800"
                style={{
                  left: f.photo_x * scale,
                  top: f.photo_y * scale,
                  width: f.photo_w * scale,
                  height: f.photo_h * scale,
                }}
              >
                foto aluno
              </div>
              <img
                src={previewUrl}
                alt="template"
                draggable={false}
                className="absolute inset-0 pointer-events-none"
                style={{ width: stageW, height: stageH }}
              />
              <div
                className="absolute pointer-events-none font-bold whitespace-nowrap"
                style={{
                  left: f.name_x * scale,
                  top: f.name_y * scale,
                  transform: "translate(-50%, -100%)",
                  fontSize: f.name_font_size * scale,
                  color: f.name_color,
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                NOME DO ALUNO
              </div>
              <div
                className="absolute pointer-events-none whitespace-nowrap"
                style={{
                  left: f.date_x * scale,
                  top: f.date_y * scale,
                  transform: "translate(-50%, -100%)",
                  fontSize: f.date_font_size * scale,
                  color: f.date_color,
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                {new Date().toLocaleDateString("pt-BR")}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-rose-900/60">
              Suba um template pra ver o preview.
            </div>
          )}
        </div>
        {tplSize && (
          <p className="text-[11px] text-rose-900/60 mt-2">
            Template: {tplSize.w} × {tplSize.h} px. Ajuste os números abaixo olhando o preview.
          </p>
        )}
      </div>



      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(([k, label, type]) => (
          <label key={k} className="text-xs text-rose-900">
            <span className="block font-semibold mb-1">{label}</span>
            <input
              type={type}
              value={f[k] as number}
              onChange={(e) => upd(k, Number(e.target.value) as Cfg[typeof k])}
              className="w-full border border-pink-200 rounded-lg px-2 py-1"
            />
          </label>
        ))}
        <label className="text-xs text-rose-900">
          <span className="block font-semibold mb-1">Cor do nome</span>
          <input type="color" value={f.name_color} onChange={(e) => upd("name_color", e.target.value)} className="w-full h-8" />
        </label>
        <label className="text-xs text-rose-900">
          <span className="block font-semibold mb-1">Cor da data</span>
          <input type="color" value={f.date_color} onChange={(e) => upd("date_color", e.target.value)} className="w-full h-8" />
        </label>
      </div>

      <div className="flex items-center justify-between">
        {msg && <span className="text-sm text-pink-700">{msg}</span>}
        <button
          type="submit"
          disabled={busy}
          className="ml-auto bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-black px-5 py-2 rounded-full text-sm"
        >
          {busy ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

function AdminCertificatesConfigPage() {
  const nav = useNavigate();
  const me = useServerFn(adminMe);
  const listFn = useServerFn(listCourseCertConfigs);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    me().then((r) => {
      if (!mounted) return;
      if (!r.authenticated) nav({ to: "/admin/login" });
      else setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [me, nav]);

  const { data } = useQuery({
    queryKey: ["admin-cert-configs"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-rose-700">Carregando...</div>;

  const courses = data?.courses ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-pink-800">Certificados por Curso</h1>
            <p className="text-sm text-rose-900/60 mt-1">
              Cada curso pode ter seu próprio template. Liberação após {data?.unlock_days ?? 8} dias do 1º acesso.
            </p>
          </div>
          <a href="/admin" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">← Voltar</a>
        </div>

        {courses.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-rose-900/70">
            Nenhum curso cadastrado. Crie cursos em <a href="/admin/courses" className="text-pink-700 underline">/admin/courses</a>.
          </div>
        )}

        {courses.map((c) => (
          <CourseCertForm
            key={c.id}
            courseId={c.id}
            title={c.title}
            initial={c.config as Cfg}
            templateUrl={c.template_url}
            hasOverride={c.has_override}
          />
        ))}
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import { getTemplateConfig, updateTemplateConfig } from "@/lib/certificates.functions";

export const Route = createFileRoute("/admin/template")({
  component: TemplatePage,
});

function fileToB64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      resolve(s.slice(s.indexOf(",") + 1));
    };
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

function TemplatePage() {
  const nav = useNavigate();
  const me = useServerFn(adminMe);
  const fetchCfg = useServerFn(getTemplateConfig);
  const save = useServerFn(updateTemplateConfig);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    me().then((r) => {
      if (!r.authenticated) nav({ to: "/admin/login" });
      else setReady(true);
    });
  }, [me, nav]);

  const { data, refetch } = useQuery({
    queryKey: ["template-cfg"],
    queryFn: () => fetchCfg(),
    enabled: ready,
  });

  const [form, setForm] = useState({
    photo_x: 100, photo_y: 100, photo_w: 300, photo_h: 300,
    name_x: 400, name_y: 500, name_font_size: 48, name_color: "#000000",
    date_x: 400, date_y: 560, date_font_size: 24, date_color: "#000000",
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        photo_x: data.photo_x, photo_y: data.photo_y, photo_w: data.photo_w, photo_h: data.photo_h,
        name_x: data.name_x, name_y: data.name_y, name_font_size: data.name_font_size, name_color: data.name_color,
        date_x: data.date_x, date_y: data.date_y, date_font_size: data.date_font_size, date_color: data.date_color,
      });
    }
  }, [data]);

  // preview do template (novo arquivo ou atual)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(data?.template_url ?? null);
  }, [file, data?.template_url]);

  const [tplSize, setTplSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!previewUrl) return;
    if (file?.type === "application/pdf") { setTplSize(null); return; }
    const img = new Image();
    img.onload = () => setTplSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = previewUrl;
  }, [previewUrl, file]);

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
  const stageH = useMemo(() => (tplSize ? tplSize.h * scale : 400), [tplSize, scale]);

  if (!ready) return <div className="p-8">Carregando...</div>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload: {
        photo_x: number; photo_y: number; photo_w: number; photo_h: number;
        name_x: number; name_y: number; name_font_size: number; name_color: string;
        date_x: number; date_y: number; date_font_size: number; date_color: string;
        templateBase64?: string; templateMime?: string; templateExt?: string;
      } = { ...form };
      if (file) {
        payload.templateBase64 = await fileToB64(file);
        payload.templateMime = file.type;
        payload.templateExt = file.name.split(".").pop() || "bin";
      }
      await save({ data: payload });
      setMsg("Salvo!");
      setFile(null);
      refetch();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/admin" className="text-sm text-blue-600 hover:underline">← Voltar</a>
        <h1 className="text-3xl font-bold my-4">Configurar Template</h1>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-6">
          {/* form */}
          <div className="bg-white rounded-xl shadow p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Arquivo do template (PNG transparente recomendado / JPG / PDF)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {data?.template_url && !file && (
                <p className="text-xs text-gray-500 mt-1">
                  Atual: <a href={data.template_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">ver</a>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Dica: suba um PNG com a área da foto <strong>transparente</strong>. A foto do aluno vai ficar atrás e o template por cima.
              </p>
            </div>

            <fieldset className="border rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Foto (origem = canto superior esquerdo)</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["photo_x", "photo_y", "photo_w", "photo_h"] as const).map((k) => (
                  <label key={k} className="text-xs">
                    {k}
                    <input
                      type="number"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1 mt-1"
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Nome (x = centro do texto, y = base do texto)</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["name_x", "name_y", "name_font_size"] as const).map((k) => (
                  <label key={k} className="text-xs">
                    {k}
                    <input
                      type="number"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1 mt-1"
                    />
                  </label>
                ))}
                <label className="text-xs">
                  name_color
                  <input
                    type="color"
                    value={form.name_color}
                    onChange={(e) => setForm({ ...form, name_color: e.target.value })}
                    className="w-full h-9 border rounded mt-1"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="border rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Data (x = centro, y = base)</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["date_x", "date_y", "date_font_size"] as const).map((k) => (
                  <label key={k} className="text-xs">
                    {k}
                    <input
                      type="number"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1 mt-1"
                    />
                  </label>
                ))}
                <label className="text-xs">
                  date_color
                  <input
                    type="color"
                    value={form.date_color}
                    onChange={(e) => setForm({ ...form, date_color: e.target.value })}
                    className="w-full h-9 border rounded mt-1"
                  />
                </label>
              </div>
            </fieldset>

            {msg && <p className="text-sm">{msg}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 w-full"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {/* preview ao vivo */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Preview ao vivo</p>
            <div
              ref={stageRef}
              className="bg-white rounded-xl shadow overflow-hidden"
              style={{ touchAction: "none" }}
            >
              {previewUrl && tplSize ? (
                <div className="relative bg-white" style={{ width: stageW, height: stageH }}>
                  {/* fundo branco + retângulo da foto */}
                  <div
                    className="absolute border-2 border-dashed border-amber-500 bg-amber-100/40 flex items-center justify-center text-xs text-amber-800 text-center"
                    style={{
                      left: form.photo_x * scale,
                      top: form.photo_y * scale,
                      width: form.photo_w * scale,
                      height: form.photo_h * scale,
                    }}
                  >
                    foto aluno
                  </div>
                  {/* template por cima */}
                  <img
                    src={previewUrl}
                    alt="template"
                    draggable={false}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: stageW, height: stageH }}
                  />
                  {/* nome */}
                  <div
                    className="absolute pointer-events-none font-bold whitespace-nowrap"
                    style={{
                      left: form.name_x * scale,
                      top: form.name_y * scale,
                      transform: "translate(-50%, -100%)",
                      fontSize: form.name_font_size * scale,
                      color: form.name_color,
                      fontFamily: "Helvetica, Arial, sans-serif",
                    }}
                  >
                    NOME DO ALUNO
                  </div>
                  {/* data */}
                  <div
                    className="absolute pointer-events-none whitespace-nowrap"
                    style={{
                      left: form.date_x * scale,
                      top: form.date_y * scale,
                      transform: "translate(-50%, -100%)",
                      fontSize: form.date_font_size * scale,
                      color: form.date_color,
                      fontFamily: "Helvetica, Arial, sans-serif",
                    }}
                  >
                    {new Date().toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/2] flex items-center justify-center text-sm text-gray-400 p-6 text-center">
                  {previewUrl ? "PDF não tem preview interativo — salve e teste pelo /certificado." : "Suba um template pra ver o preview."}
                </div>
              )}
            </div>
            {tplSize && (
              <p className="text-xs text-gray-500 mt-2">
                Template: {tplSize.w} × {tplSize.h} px. Ajuste os números à esquerda olhando o preview.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

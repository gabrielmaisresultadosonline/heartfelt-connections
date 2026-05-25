import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateCertificate, getPublicTemplateConfig } from "@/lib/certificates.functions";

export const Route = createFileRoute("/certificado")({
  head: () => ({
    meta: [
      { title: "Receba seu Certificado" },
      { name: "description", content: "Envie sua foto, posicione e receba seu certificado oficial." },
    ],
  }),
  component: CertificadoPage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      resolve(s.slice(s.indexOf(",") + 1));
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function CertificadoPage() {
  const generate = useServerFn(generateCertificate);
  const fetchCfg = useServerFn(getPublicTemplateConfig);

  const { data: cfg } = useQuery({
    queryKey: ["public-template-cfg"],
    queryFn: () => fetchCfg(),
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);

  // posição da foto em coordenadas do template (px do PNG original)
  const [pos, setPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  // posição do nome e data (px do template)
  const [namePos, setNamePos] = useState({ x: 0, y: 0, size: 48 });
  const [datePos, setDatePos] = useState({ x: 0, y: 0, size: 24 });
  const [dateText, setDateText] = useState(() => new Date().toLocaleDateString("pt-BR"));
  const [tplSize, setTplSize] = useState<{ w: number; h: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ pdfUrl: string; enhancedPhotoUrl: string } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageW, setStageW] = useState(700);

  // inicializar posição com defaults do template
  useEffect(() => {
    if (cfg && pos.w === 0) {
      setPos({ x: cfg.photo_x, y: cfg.photo_y, w: cfg.photo_w, h: cfg.photo_h });
      setNamePos({ x: cfg.name_x, y: cfg.name_y, size: cfg.name_font_size });
      setDatePos({ x: cfg.date_x, y: cfg.date_y, size: cfg.date_font_size });
    }
  }, [cfg, pos.w]);

  // carregar dimensões do template
  useEffect(() => {
    if (!cfg?.template_url || cfg.template_is_pdf) return;
    const img = new Image();
    img.onload = () => setTplSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = cfg.template_url;
  }, [cfg]);

  // medir largura disponível do palco
  useEffect(() => {
    const update = () => {
      if (stageRef.current) {
        const w = Math.min(stageRef.current.clientWidth, 900);
        setStageW(w);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = useMemo(() => (tplSize ? stageW / tplSize.w : 1), [tplSize, stageW]);
  const stageH = useMemo(() => (tplSize ? tplSize.h * scale : 400), [tplSize, scale]);

  // preview do arquivo
  useEffect(() => {
    if (!file) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // drag genérico (foto, nome, data)
  type DragTarget = "photo" | "name" | "date";
  const dragRef = useRef<{ target: DragTarget; startX: number; startY: number; posX: number; posY: number } | null>(null);
  function startDrag(target: DragTarget) {
    return (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const cur = target === "photo" ? pos : target === "name" ? namePos : datePos;
      dragRef.current = { target, startX: e.clientX, startY: e.clientY, posX: cur.x, posY: cur.y };
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.target === "photo") setPos((p) => ({ ...p, x: d.posX + dx, y: d.posY + dy }));
    else if (d.target === "name") setNamePos((p) => ({ ...p, x: d.posX + dx, y: d.posY + dy }));
    else setDatePos((p) => ({ ...p, x: d.posX + dx, y: d.posY + dy }));
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  function scalePhoto(factor: number) {
    setPos((p) => {
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      const nw = Math.max(50, p.w * factor);
      const nh = Math.max(50, p.h * factor);
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  }

  function resetPos() {
    if (cfg) {
      setPos({ x: cfg.photo_x, y: cfg.photo_y, w: cfg.photo_w, h: cfg.photo_h });
      setNamePos({ x: cfg.name_x, y: cfg.name_y, size: cfg.name_font_size });
      setDatePos({ x: cfg.date_x, y: cfg.date_y, size: cfg.date_font_size });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return setError("Selecione uma foto");
    if (fullName.trim().length < 2) return setError("Informe seu nome completo");
    if (file.size > 8 * 1024 * 1024) return setError("Foto muito grande (máx 8MB)");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setError("Use JPG, PNG ou WEBP");
    }
    setLoading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await generate({
        data: {
          fullName: fullName.trim(),
          email,
          photoBase64: b64,
          photoMime: file.type as "image/jpeg" | "image/png" | "image/webp",
          useAI,
          photoX: Math.round(pos.x),
          photoY: Math.round(pos.y),
          photoW: Math.round(pos.w),
          photoH: Math.round(pos.h),
        },
      });
      setResult({ pdfUrl: res.pdfUrl, enhancedPhotoUrl: res.enhancedPhotoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Receba seu Certificado</h1>
        <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
          Envie sua foto, posicione no template e gere seu certificado.
        </p>

        {result ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Certificado pronto!</h2>
            <img
              src={result.enhancedPhotoUrl}
              alt="Foto usada"
              className="w-40 h-40 object-cover rounded-full mx-auto mb-6 border-4 border-amber-400"
            />
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Baixar Certificado PDF
            </a>
            <button
              onClick={() => { setResult(null); setFile(null); }}
              className="block mx-auto mt-4 text-sm text-gray-500 hover:underline"
            >
              Gerar outro
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
            {/* COLUNA 1: formulário */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 order-2 md:order-1">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={120}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sua foto *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WEBP até 8MB</p>
              </div>

              {photoUrl && (
                <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Ajustar foto no preview →</p>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => scalePhoto(1.1)} className="px-3 py-1 bg-white border rounded text-sm">+ Zoom</button>
                    <button type="button" onClick={() => scalePhoto(0.9)} className="px-3 py-1 bg-white border rounded text-sm">– Zoom</button>
                    <button type="button" onClick={resetPos} className="px-3 py-1 bg-white border rounded text-sm">Resetar</button>
                  </div>
                  <p className="text-xs text-gray-500">Arraste a foto no preview pra mover.</p>
                </div>
              )}

              <label className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-amber-50">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="font-semibold">Aprimorar com IA (+blazer profissional)</span>
                  <span className="block text-xs text-gray-500">
                    Adiciona blazer, fundo neutro e iluminação de estúdio. Demora ~20s e gera um pequeno custo.
                  </span>
                </span>
              </label>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg"
              >
                {loading ? (useAI ? "Processando (~30s)..." : "Gerando...") : "Gerar meu Certificado"}
              </button>
            </div>

            {/* COLUNA 2: preview ao vivo */}
            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview ao vivo</p>
              <div
                ref={stageRef}
                className="bg-white rounded-xl shadow-lg overflow-hidden select-none"
                style={{ touchAction: "none" }}
              >
                {cfg?.template_url && tplSize ? (
                  <div
                    className="relative bg-white"
                    style={{ width: stageW, height: stageH }}
                  >
                    {/* foto - fica atrás do overlay */}
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt="sua foto"
                        draggable={false}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        className="absolute cursor-move"
                        style={{
                          left: pos.x * scale,
                          top: pos.y * scale,
                          width: pos.w * scale,
                          height: pos.h * scale,
                          objectFit: "cover",
                          touchAction: "none",
                        }}
                      />
                    )}
                    {/* overlay PNG transparente por cima */}
                    <img
                      src={cfg.template_url}
                      alt="template"
                      draggable={false}
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: stageW, height: stageH }}
                    />
                    {/* nome */}
                    {fullName && (
                      <div
                        className="absolute pointer-events-none font-bold text-center whitespace-nowrap"
                        style={{
                          left: cfg.name_x * scale,
                          top: cfg.name_y * scale,
                          transform: "translate(-50%, -100%)",
                          fontSize: cfg.name_font_size * scale,
                          color: cfg.name_color,
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}
                      >
                        {fullName}
                      </div>
                    )}
                    {/* placeholder quando não tem foto */}
                    {!photoUrl && (
                      <div
                        className="absolute border-2 border-dashed border-amber-400 bg-amber-50/40 flex items-center justify-center text-xs text-amber-700 text-center px-2"
                        style={{
                          left: pos.x * scale,
                          top: pos.y * scale,
                          width: pos.w * scale,
                          height: pos.h * scale,
                        }}
                      >
                        Sua foto vai aqui
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[3/2] flex items-center justify-center text-sm text-gray-400 p-6 text-center">
                    {cfg?.template_url ? "Carregando template..." : "Template ainda não configurado pelo admin."}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                A foto fica <strong>atrás</strong> do template (que é transparente nas áreas certas).
                Arraste pra posicionar, use os botões de zoom pra ajustar.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

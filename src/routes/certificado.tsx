import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateCertificate, getPublicTemplateConfig, checkEmailAccess } from "@/lib/certificates.functions";


export const Route = createFileRoute("/certificado")({
  head: () => ({
    meta: [
      { title: "Receba seu Certificado" },
      {
        name: "description",
        content: "Envie sua foto, posicione e receba seu certificado oficial.",
      },
      { httpEquiv: "Cache-Control", content: "no-cache, no-store, must-revalidate" },
      { httpEquiv: "Pragma", content: "no-cache" },
      { httpEquiv: "Expires", content: "0" },
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
  const checkAccess = useServerFn(checkEmailAccess);

  const { data: cfg } = useQuery({
    queryKey: ["public-template-cfg"],
    queryFn: () => fetchCfg(),
  });

  // Gate de acesso por email (Kiwify)
  const [gateEmail, setGateEmail] = useState("");
  const [gateChecking, setGateChecking] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);



  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // foto recortada sem fundo (base64 PNG)
  const [enhancedB64, setEnhancedB64] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceProgress, setEnhanceProgress] = useState(0);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [enhanceMessage, setEnhanceMessage] = useState("Removendo o fundo da sua foto...");

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
  const [videoOpen, setVideoOpen] = useState(false);

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

  // Se a página voltar do bfcache (back/forward), recarrega do servidor
  // para garantir que o gate de email seja sempre exibido.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const scale = useMemo(() => (tplSize ? stageW / tplSize.w : 1), [tplSize, stageW]);
  const stageH = useMemo(() => (tplSize ? tplSize.h * scale : 400), [tplSize, scale]);

  // preview do arquivo + auto-enhance via IA
  useEffect(() => {
    if (!file) {
      setPhotoUrl(null);
      setEnhancedB64(null);
      setEnhanceError(null);
      setEnhanceProgress(0);
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);

    let cancelled = false;
    let progressTimer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      try {
        setEnhancedB64(null);
        setEnhanceError(null);
        setEnhancing(true);
        setEnhanceMessage("Removendo o fundo da sua foto...");
        setEnhanceProgress(4);

        progressTimer = setInterval(() => {
          setEnhanceProgress((p) => (p < 94 ? p + 1 : p));
        }, 900);

        const { createPhotoCutout } = await import("@/lib/photo-cutout");
        const res = await createPhotoCutout(file, ({ progress, message }: { progress: number; message: string }) => {
          if (cancelled) return;
          setEnhanceProgress((current) => Math.max(current, progress));
          setEnhanceMessage(message);
        });
        if (cancelled) return;
        setEnhancedB64(res.base64);
        setEnhanceProgress(100);
      } catch (err) {
        if (cancelled) return;
        setEnhanceError(err instanceof Error ? err.message : "Falha ao remover o fundo da foto");
        setEnhanceProgress(0);
      } finally {
        if (progressTimer) clearInterval(progressTimer);
        if (!cancelled) setEnhancing(false);
      }
    })();

    return () => {
      cancelled = true;
      if (progressTimer) clearInterval(progressTimer);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // drag genérico (foto, nome, data)
  type DragTarget = "photo" | "name" | "date";
  const dragRef = useRef<{
    target: DragTarget;
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  } | null>(null);
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
    if (enhancing) return setError("Aguarde a remoção de fundo terminar");
    if (!enhancedB64)
      return setError("A foto sem fundo ainda não foi gerada. Tente subir a foto novamente.");
    setLoading(true);
    try {
      const res = await generate({
        data: {
          fullName: fullName.trim(),
          email,
          photoBase64: enhancedB64,
          photoMime: "image/png",
          useAI: false,
          photoX: Math.round(pos.x),
          photoY: Math.round(pos.y),
          photoW: Math.round(pos.w),
          photoH: Math.round(pos.h),
          nameX: Math.round(namePos.x),
          nameY: Math.round(namePos.y),
          nameFontSize: Math.round(namePos.size),
          dateText: dateText.trim() || undefined,
          dateX: Math.round(datePos.x),
          dateY: Math.round(datePos.y),
          dateFontSize: Math.round(datePos.size),
        },
      });
      setResult({ pdfUrl: res.pdfUrl, enhancedPhotoUrl: res.enhancedPhotoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function onCheckAccess(e: React.FormEvent) {
    e.preventDefault();
    setGateError(null);
    const v = gateEmail.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      setGateError("Informe um email válido.");
      return;
    }
    setGateChecking(true);
    try {
      const res = await checkAccess({ data: { email: v } });
      if (!res.allowed) {
        if (res.reason === "refunded" || res.reason === "chargeback") {
          setGateError("Sua compra foi reembolsada/contestada. Acesso indisponível.");
        } else if (res.reason === "waiting_payment") {
          setGateError("Sua compra ainda não foi aprovada. Aguarde a confirmação do pagamento.");
        } else {
          setGateError(
            "Email não encontrado. Use o mesmo email da compra na Kiwify. Se acabou de comprar, aguarde alguns minutos.",
          );
        }
        return;
      }
      setEmail(v);
      if (res.name) setFullName(res.name);
      if (res.alreadyIssued) {
        setExistingPdfUrl(res.pdfUrl);
      }
      setAccessGranted(true);
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Erro ao verificar email");
    } finally {
      setGateChecking(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-100 py-8 px-4">
      {/* blobs decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-fuchsia-300/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-rose-200/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-white/70 backdrop-blur border border-pink-200 text-pink-700 text-xs font-semibold tracking-wider uppercase mb-3 shadow-sm">
            ✨ Certificado Oficial
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-3 bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-sm">
            Receba seu Certificado
          </h1>
          <p className="text-center text-rose-900/70 text-sm md:text-base max-w-2xl mx-auto px-2">
            Envie sua foto, posicione no template e gere seu certificado em alta qualidade.
          </p>
        </div>

        {!accessGranted ? (
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/30 ring-1 ring-pink-200 p-8 md:p-10 max-w-xl mx-auto">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
            <h2 className="text-xl md:text-2xl font-extrabold mb-2 text-center bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Acesso exclusivo para alunas
            </h2>
            <p className="text-sm text-rose-900/70 text-center mb-6">
              Digite o <strong>mesmo email</strong> usado na compra do curso na Kiwify para liberar
              seu certificado.
            </p>
            <form onSubmit={onCheckAccess} className="space-y-4">
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                required
                className="w-full border border-pink-200 bg-white/80 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
              />
              {gateError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {gateError}
                </div>
              )}
              <button
                type="submit"
                disabled={gateChecking}
                className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold py-3 rounded-full shadow-lg shadow-pink-400/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {gateChecking ? "Verificando..." : "Acessar"}
              </button>
            </form>
          </div>
        ) : existingPdfUrl ? (
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/30 ring-1 ring-pink-200 p-8 md:p-10 text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Seu certificado já foi emitido 🎉
            </h2>
            <p className="text-sm text-rose-900/70 mb-6">
              Você já gerou seu certificado anteriormente. Cada aluna pode emitir apenas 1
              certificado. Use o botão abaixo para baixá-lo novamente.
            </p>
            <a
              href={existingPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-pink-400/40 transition-all hover:scale-[1.03] active:scale-100"
            >
              Baixar meu Certificado
            </a>
          </div>
        ) : result ? (
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/30 ring-1 ring-pink-200 p-8 md:p-10 text-center max-w-xl mx-auto">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Certificado pronto! 🎉
            </h2>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 blur-md opacity-60" />
              <img
                src={result.enhancedPhotoUrl}
                alt="Foto usada"
                className="relative w-40 h-40 object-cover rounded-full mx-auto border-4 border-white shadow-xl"
              />
            </div>
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-pink-400/40 transition-all hover:scale-[1.03] active:scale-100"
            >
              Baixar Certificado PDF
            </a>
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="block mx-auto mt-4 text-sm text-rose-700/70 hover:text-pink-700 hover:underline"
            >
              Gerar outro
            </button>
          </div>
        ) : (
          <>
            <div className="max-w-5xl mx-auto mb-8 grid md:grid-cols-2 gap-6 items-stretch">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-300/30 ring-2 ring-pink-300 bg-black group">
                <video
                  src="/videos/tutorial-certificado.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain block bg-black aspect-video"
                />
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md transition"
                  aria-label="Abrir vídeo em tela cheia"
                >
                  ⛶ Expandir
                </button>
              </div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/20 ring-1 ring-pink-200 p-6 md:p-7">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Gere seu certificado
                </h2>
                <p className="text-sm text-rose-900/70 mb-5">
                  Siga o passo a passo abaixo. É rapidinho 💖
                </p>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white font-black flex items-center justify-center shadow-md">1</span>
                    <p className="text-sm text-rose-900 leading-relaxed">
                      Preencha seu <strong>nome completo</strong> e a <strong>data</strong> em que deseja gerar o certificado.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white font-black flex items-center justify-center shadow-md">2</span>
                    <p className="text-sm text-rose-900 leading-relaxed">
                      Envie uma <strong>foto sua da cintura pra cima</strong>, mostrando o rosto olhando pra frente.
                      <span className="block mt-1 text-rose-700/80">
                        ⚠️ Não pode ser foto em frente ao espelho — precisa ser uma foto de perfil. Nosso gerador vai recortar somente você da foto e incluir no certificado.
                      </span>
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white font-black flex items-center justify-center shadow-md">3</span>
                    <p className="text-sm text-rose-900 leading-relaxed">
                      Depois disso é só clicar em <strong>Gerar Certificado</strong> e imprimir 🎓
                    </p>
                  </li>
                </ol>
                <p className="mt-6 pt-4 border-t border-pink-100 text-center text-sm font-semibold text-pink-700">
                  Obrigada pela confiança de sempre! 💕
                </p>
              </div>
            </div>
            <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
            {/* COLUNA 1: formulário */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/20 ring-1 ring-pink-200 p-6 md:p-7 space-y-4 order-2 md:order-1">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
              <div>
                <label className="block text-sm font-semibold text-rose-900 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={120}
                  className="w-full border border-pink-200 bg-white/80 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rose-900 mb-1">
                  Email da compra
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full border border-pink-200 bg-pink-50/60 text-rose-900/80 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-rose-900/60 mt-1">
                  Travado: é o mesmo email usado para acessar esta página.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-rose-900 mb-1">
                  Data de conclusão
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  maxLength={40}
                  className="w-full border border-pink-200 bg-white/80 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rose-900 mb-1">Sua foto *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-fuchsia-600 file:text-white file:font-semibold file:cursor-pointer hover:file:opacity-90"
                />
                <p className="text-xs text-rose-700/60 mt-1">JPG, PNG ou WEBP até 8MB</p>

                {/* Dicas de qualidade da foto */}
                <div className="mt-3 border border-pink-200 rounded-xl p-3 bg-gradient-to-br from-pink-50 to-fuchsia-50">
                  <p className="text-xs font-semibold text-rose-900 mb-1">
                    📸 Dicas para uma foto perfeita
                  </p>
                  <ul className="text-xs text-rose-800/80 space-y-0.5 list-disc list-inside">
                    <li>
                      Foto <strong>de frente</strong>, mostrando bem o rosto
                    </li>
                    <li>
                      Da <strong>cintura para cima</strong>, com boa iluminação
                    </li>
                    <li>
                      <strong>Não use selfie de espelho</strong> nem foto borrada
                    </li>
                    <li>Fundo simples; o sistema troca por fundo branco automaticamente</li>
                  </ul>
                </div>
              </div>

              {/* Barra de progresso da IA */}
              {enhancing && (
                <div className="border border-pink-300 rounded-xl p-4 bg-gradient-to-br from-pink-50 to-fuchsia-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-rose-900 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      Preparando sua foto sem fundo...
                    </p>
                    <span className="text-xs font-bold text-pink-700">{enhanceProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-600 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${enhanceProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-rose-700/70">{enhanceMessage}</p>
                </div>
              )}

              {enhanceError && !enhancing && (
                <div className="border border-red-300 rounded-xl p-3 bg-red-50 space-y-2">
                  <p className="text-sm text-red-700">
                    <strong>Erro ao preparar a foto:</strong> {enhanceError}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFile((f) => (f ? new File([f], f.name, { type: f.type }) : null))
                    }
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {enhancedB64 && !enhancing && (
                <div className="border border-pink-200 rounded-xl p-3 bg-pink-50/60 space-y-2">
                  <p className="text-xs font-semibold text-rose-900">
                    ✨ Foto pronta sem fundo! Ajustar no preview →
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => scalePhoto(1.1)}
                      className="px-3 py-1 bg-white border border-pink-200 rounded-full text-sm hover:bg-pink-50 transition"
                    >
                      + Zoom
                    </button>
                    <button
                      type="button"
                      onClick={() => scalePhoto(0.9)}
                      className="px-3 py-1 bg-white border border-pink-200 rounded-full text-sm hover:bg-pink-50 transition"
                    >
                      – Zoom
                    </button>
                    <button
                      type="button"
                      onClick={resetPos}
                      className="px-3 py-1 bg-white border border-pink-200 rounded-full text-sm hover:bg-pink-50 transition"
                    >
                      Resetar
                    </button>
                  </div>
                  <p className="text-xs text-rose-700/60">
                    Arraste foto, nome e data no preview pra posicionar.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || enhancing || !enhancedB64}
                className="relative w-full overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full shadow-lg shadow-pink-400/40 transition-all hover:scale-[1.02] active:scale-100"
              >
                <span className="relative z-10">
                  {loading
                    ? "Gerando certificado..."
                    : enhancing
                      ? "Removendo fundo da foto..."
                      : !enhancedB64
                        ? "Envie sua foto primeiro"
                        : "Gerar meu Certificado ✨"}
                </span>
                {!loading && !enhancing && enhancedB64 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  />
                )}
              </button>
            </div>

            {/* COLUNA 2: preview ao vivo */}
            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                Preview ao vivo
              </p>
              <div
                ref={stageRef}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-300/30 ring-1 ring-pink-200 overflow-hidden select-none"
                style={{ touchAction: "none" }}
              >
                {cfg?.template_url && tplSize ? (
                  <div className="relative bg-white" style={{ width: stageW, height: stageH }}>
                    {(enhancedB64 || photoUrl) && (
                      <img
                        src={enhancedB64 ? `data:image/png;base64,${enhancedB64}` : photoUrl!}
                        alt="sua foto"
                        draggable={false}
                        onPointerDown={startDrag("photo")}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        className={`absolute cursor-move transition-opacity ${enhancing ? "opacity-40" : "opacity-100"}`}
                        style={{
                          left: pos.x * scale,
                          top: pos.y * scale,
                          width: pos.w * scale,
                          height: pos.h * scale,
                          objectFit: "contain",
                          objectPosition: "center bottom",
                          touchAction: "none",
                        }}
                      />
                    )}
                    {enhancing && (
                      <div
                        className="absolute flex items-center justify-center bg-white/60 backdrop-blur-sm rounded"
                        style={{
                          left: pos.x * scale,
                          top: pos.y * scale,
                          width: pos.w * scale,
                          height: pos.h * scale,
                        }}
                      >
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                          <p className="mt-2 text-xs font-semibold text-pink-700">
                            Removendo fundo...
                          </p>
                        </div>
                      </div>
                    )}
                    <img
                      src={cfg.template_url}
                      alt="template"
                      draggable={false}
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: stageW, height: stageH }}
                    />
                    <div
                      onPointerDown={startDrag("name")}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      className="absolute font-bold text-center whitespace-nowrap cursor-move px-2 rounded hover:bg-pink-100/40"
                      style={{
                        left: namePos.x * scale,
                        top: namePos.y * scale,
                        transform: "translate(-50%, -100%)",
                        fontSize: namePos.size * scale,
                        color: cfg.name_color,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        touchAction: "none",
                      }}
                    >
                      {fullName || "SEU NOME"}
                    </div>
                    <div
                      onPointerDown={startDrag("date")}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      className="absolute whitespace-nowrap cursor-move px-2 rounded hover:bg-pink-100/40"
                      style={{
                        left: datePos.x * scale,
                        top: datePos.y * scale,
                        transform: "translate(-50%, -100%)",
                        fontSize: datePos.size * scale,
                        color: cfg.date_color,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        touchAction: "none",
                      }}
                    >
                      {dateText}
                    </div>
                    {!photoUrl && (
                      <div
                        className="absolute border-2 border-dashed border-pink-400 bg-pink-50/50 flex items-center justify-center text-xs text-pink-700 text-center px-2 rounded"
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
                  <div className="aspect-[3/2] flex items-center justify-center text-sm text-rose-700/60 p-6 text-center">
                    {cfg?.template_url
                      ? "Carregando template..."
                      : "Template ainda não configurado pelo admin."}
                  </div>
                )}
              </div>
              <p className="text-xs text-rose-700/60 mt-2 px-1">
                A foto fica <strong>atrás</strong> do template (que é transparente nas áreas
                certas). Arraste pra posicionar, use os botões de zoom pra ajustar.
              </p>
            </div>
          </form>
          </>
        )}
      </div>
    </div>
  );
}

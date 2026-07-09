import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Mail, Loader2, XCircle, Clock } from "lucide-react";
import { pollCheckoutStatus } from "@/lib/checkout.functions";

export const Route = createFileRoute("/obrigado")({
  component: Obrigado,
  head: () => ({ meta: [{ title: "Verificando pagamento — Beleza Liso Perfeito" }] }),
});

type Status = "checking" | "pending" | "approved" | "expired" | "unknown";

function Obrigado() {
  const poll = useServerFn(pollCheckoutStatus);
  const nsu = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("nsu") || "";
  }, []);
  const [status, setStatus] = useState<Status>(nsu ? "checking" : "unknown");
  const [remainingMs, setRemainingMs] = useState<number>(20 * 60 * 1000);

  useEffect(() => {
    if (!nsu) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      if (stopped) return;
      try {
        const r = await poll({ data: { order_nsu: nsu } });
        if (stopped) return;
        if (r.status === "approved") {
          setStatus("approved");
          return;
        }
        if (r.status === "expired") {
          setStatus("expired");
          return;
        }
        if (r.status === "unknown") {
          setStatus("unknown");
          return;
        }
        setStatus("pending");
        if ("remaining_ms" in r && typeof r.remaining_ms === "number") {
          setRemainingMs(r.remaining_ms);
        }
      } catch {
        /* keep trying */
      }
      timer = setTimeout(tick, 5000);
    }
    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [nsu, poll]);

  // Countdown local
  useEffect(() => {
    if (status !== "pending") return;
    const i = setInterval(() => setRemainingMs((v) => Math.max(0, v - 1000)), 1000);
    return () => clearInterval(i);
  }, [status]);

  const mm = String(Math.floor(remainingMs / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-pink-100 p-8 md:p-12 text-center">
        {status === "approved" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={44} className="text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Pagamento confirmado!</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Seu acesso ao <strong>Curso de Alisamento Perfeito</strong> foi enviado para o seu e-mail com{" "}
              <strong>login e senha</strong>.
            </p>
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 flex items-start gap-3 text-left mb-6">
              <Mail className="text-pink-600 shrink-0 mt-1" size={22} />
              <div className="text-sm text-gray-700">
                Verifique também a caixa de <strong>spam / promoções</strong>. O e-mail costuma chegar em poucos minutos.
              </div>
            </div>
            <Link
              to="/login"
              className="inline-block bg-[#d82298] hover:bg-[#b8127f] text-white font-black uppercase tracking-wider py-4 px-8 rounded-full shadow-lg transition"
            >
              Ir para a área do aluno
            </Link>
          </>
        ) : status === "expired" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle size={44} className="text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Pagamento não confirmado</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Não recebemos o pagamento em até 20 minutos e este pedido foi marcado como <strong>expirado</strong>.
              Se você já pagou, aguarde alguns minutos — assim que a InfinitePay confirmar, o acesso será liberado
              automaticamente. Você também pode iniciar um novo pedido.
            </p>
            <Link
              to="/promocc"
              className="inline-block bg-[#d82298] hover:bg-[#b8127f] text-white font-black uppercase tracking-wider py-4 px-8 rounded-full shadow-lg transition"
            >
              Tentar novamente
            </Link>
          </>
        ) : status === "unknown" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Mail size={44} className="text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Estamos verificando</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Assim que o pagamento for confirmado enviaremos o e-mail com seus dados de acesso.
            </p>
            <Link
              to="/login"
              className="inline-block bg-[#d82298] hover:bg-[#b8127f] text-white font-black uppercase tracking-wider py-4 px-8 rounded-full shadow-lg transition"
            >
              Já recebi o email → Entrar
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={44} className="text-[#d82298] animate-spin" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Aguardando confirmação do pagamento…
            </h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Estamos verificando com a <strong>InfinitePay</strong> automaticamente. Assim que confirmar, seu acesso
              será liberado e enviado por e-mail.
            </p>
            <div className="inline-flex items-center gap-2 text-sm bg-pink-50 border border-pink-200 rounded-full px-4 py-2 text-pink-800 font-bold">
              <Clock size={16} /> Tempo restante para verificação: {mm}:{ss}
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Você pode fechar esta janela — o pagamento será reconhecido automaticamente e o e-mail chegará mesmo
              assim.
            </p>
          </>
        )}
        <p className="mt-6 text-xs text-gray-500">
          Precisa de ajuda? Envie e-mail para{" "}
          <a href="mailto:suporte@belezalisoperfeito.online" className="text-pink-700 underline">
            suporte@belezalisoperfeito.online
          </a>
        </p>
      </div>
    </div>
  );
}

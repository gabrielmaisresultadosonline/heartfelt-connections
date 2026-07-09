import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  component: Obrigado,
  head: () => ({
    meta: [{ title: "Pagamento confirmado — Beleza Liso Perfeito" }],
  }),
});

function Obrigado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-pink-100 p-8 md:p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={44} className="text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          Pagamento confirmado!
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Seu acesso ao <strong>Curso de Alisamento Perfeito</strong> foi enviado para o
          seu e-mail com <strong>login e senha</strong>.
        </p>
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 flex items-start gap-3 text-left mb-6">
          <Mail className="text-pink-600 shrink-0 mt-1" size={22} />
          <div className="text-sm text-gray-700">
            Verifique também a caixa de <strong>spam / promoções</strong>. O e-mail
            costuma chegar em até 5 minutos após a aprovação do pagamento.
          </div>
        </div>
        <Link
          to="/login"
          className="inline-block bg-[#d82298] hover:bg-[#b8127f] text-white font-black uppercase tracking-wider py-4 px-8 rounded-full shadow-lg transition"
        >
          Ir para a área do aluno
        </Link>
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

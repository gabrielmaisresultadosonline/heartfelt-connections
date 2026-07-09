import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { studentLogin, studentForgotPassword } from "@/lib/students.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Área do Aluno" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const login = useServerFn(studentLogin);
  const forgot = useServerFn(studentForgotPassword);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [fEmail, setFEmail] = useState("");
  const [fBusy, setFBusy] = useState(false);
  const [fMsg, setFMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await login({ data: { email, password } });
      if (!r.ok) setErr(r.error);
      else nav({ to: "/curso" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setFMsg(null);
    setFBusy(true);
    try {
      const r = await forgot({ data: { email: fEmail } });
      setFMsg(r.ok ? ("message" in r ? r.message : "E-mail enviado.") : `Erro: ${r.error}`);
    } catch (e) {
      setFMsg(e instanceof Error ? e.message : "Erro ao enviar e-mail.");
    } finally {
      setFBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 p-8">
        <h1 className="text-2xl md:text-3xl font-black text-center bg-gradient-to-r from-[#d82298] to-pink-600 bg-clip-text text-transparent mb-2">
          Área do Aluno
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Entre com os dados que enviamos por e-mail.
        </p>

        {!showForgot ? (
          <>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                  placeholder="ALIS-XXXX"
                />
              </div>
              {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d82298] hover:bg-[#b8127f] disabled:opacity-60 text-white font-black uppercase tracking-wider py-3 rounded-full shadow-lg transition"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setFEmail(email);
                  setFMsg(null);
                }}
                className="text-sm text-pink-700 hover:text-pink-900 font-bold underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={onForgot} className="space-y-4">
            <p className="text-sm text-gray-600">
              Digite o e-mail da compra. Enviaremos uma nova senha para ele.
            </p>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                required
                value={fEmail}
                onChange={(e) => setFEmail(e.target.value)}
                className="mt-1 w-full border border-pink-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="seu@email.com"
              />
            </div>
            {fMsg && (
              <p className="text-sm text-pink-800 bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">
                {fMsg}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={fBusy}
                className="flex-1 bg-[#d82298] hover:bg-[#b8127f] disabled:opacity-60 text-white font-black uppercase tracking-wider py-3 rounded-full shadow-lg transition"
              >
                {fBusy ? "Enviando..." : "Enviar nova senha"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="px-4 py-3 rounded-full border border-pink-200 text-pink-700 font-bold"
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-500 mt-6">
          Ainda não comprou?{" "}
          <a href="/promocc" className="text-pink-700 font-bold underline">
            Ver o curso
          </a>
        </p>
      </div>
    </div>
  );
}

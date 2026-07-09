import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Clock, Lock, ArrowLeft, Download, LogOut } from "lucide-react";
import { studentLogout, studentMe } from "@/lib/students.functions";
import {
  listMyCertificates,
  generateMyCertificate,
} from "@/lib/course-certificates.functions";

export const Route = createFileRoute("/meus-certificados")({
  component: MyCertificatesPage,
  head: () => ({ meta: [{ title: "Meus Certificados — Alisamento Perfeito" }] }),
});

type Item = {
  course_id: string;
  slug: string;
  title: string;
  cover_file: string | null;
  unlock_at: string;
  days_remaining: number;
  remaining_ms: number;
  available: boolean;
  issued_pdf_url: string | null;
};

function useCountdown(unlockAt: string): { d: number; h: number; m: number; s: number; done: boolean } {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const ms = Math.max(0, new Date(unlockAt).getTime() - now);
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return { d, h, m, s: sec, done: ms === 0 };
  }, [now, unlockAt]);
}

function fileToBase64(file: File): Promise<{ b64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf(",");
      resolve({ b64: i >= 0 ? s.slice(i + 1) : s, mime: file.type });
    };
    r.onerror = () => reject(new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}

function CertificateCard({ it }: { it: Item }) {
  const qc = useQueryClient();
  const gen = useServerFn(generateMyCertificate);
  const c = useCountdown(it.unlock_at);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setErr("Envie uma foto sua.");
    if (name.trim().length < 2) return setErr("Digite seu nome completo.");
    setBusy(true);
    setErr(null);
    try {
      const { b64, mime } = await fileToBase64(file);
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        throw new Error("Formato inválido (use JPG, PNG ou WEBP).");
      }
      const r = await gen({
        data: { courseId: it.course_id, fullName: name.trim(), photoBase64: b64, photoMime: mime as "image/jpeg" | "image/png" | "image/webp" },
      });
      if (r.ok && r.pdfUrl) window.open(r.pdfUrl, "_blank");
      qc.invalidateQueries({ queryKey: ["my-certs"] });
      setOpen(false);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Erro ao gerar certificado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="aspect-video bg-black/40 relative">
        {it.cover_file ? (
          <img src={`/api/files/${it.cover_file}`} alt={it.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full grid place-items-center text-white/40">
            <Award size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <h3 className="absolute bottom-3 left-4 right-4 font-black text-lg text-white drop-shadow">{it.title}</h3>
      </div>
      <div className="p-5 space-y-4">
        {it.issued_pdf_url ? (
          <>
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
              <Award size={16} /> Certificado emitido
            </div>
            <a
              href={it.issued_pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-3 rounded-xl transition"
            >
              <Download size={18} /> Baixar PDF
            </a>
          </>
        ) : c.done ? (
          <>
            <div className="flex items-center gap-2 text-[#ff7ac4] text-sm font-bold">
              <Award size={16} /> Disponível para emitir
            </div>
            {open ? (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-white/70"
                />
                {err && <p className="text-xs text-rose-300">{err}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 bg-[#d82298] hover:bg-[#e02fa8] disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl text-sm"
                  >
                    {busy ? "Gerando..." : "Gerar Certificado"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 w-full justify-center bg-[#d82298] hover:bg-[#e02fa8] text-white font-black px-4 py-3 rounded-xl transition"
              >
                <Award size={18} /> Emitir Certificado
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
              <Lock size={16} /> Bloqueado
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-2">
                <Clock size={14} /> Faltam
              </div>
              <div className="grid grid-cols-4 gap-2 text-white">
                {[
                  { l: "d", v: c.d },
                  { l: "h", v: c.h },
                  { l: "m", v: c.m },
                  { l: "s", v: c.s },
                ].map((x) => (
                  <div key={x.l} className="bg-white/5 rounded-lg py-2">
                    <div className="text-2xl font-black tabular-nums">{String(x.v).padStart(2, "0")}</div>
                    <div className="text-[10px] uppercase text-white/50">{x.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/50 mt-3">
                O certificado libera 8 dias após seu primeiro acesso ao curso.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MyCertificatesPage() {
  const nav = useNavigate();
  const me = useServerFn(studentMe);
  const logout = useServerFn(studentLogout);
  const listFn = useServerFn(listMyCertificates);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    me().then((r) => {
      if (!mounted) return;
      if (!r.authenticated) nav({ to: "/login" });
      else setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [me, nav]);

  const { data } = useQuery({
    queryKey: ["my-certs"],
    queryFn: () => listFn(),
    enabled: ready,
    refetchInterval: 60_000,
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;
  const items: Item[] = data && data.authenticated ? (data.items as Item[]) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0710] via-[#1a0a14] to-[#2a0a1f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/30 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav({ to: "/cursos" })}
            className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-full"
          >
            <ArrowLeft size={16} /> Cursos
          </button>
          <h1 className="font-black text-lg md:text-xl">Meus Certificados</h1>
        </div>
        <button
          onClick={async () => {
            await logout();
            nav({ to: "/login" });
          }}
          className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <p className="text-white/70 text-sm mb-6">
          Cada curso que você tem acesso libera um certificado após 8 dias do seu primeiro acesso.
        </p>
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/70">
            Nenhum curso vinculado ainda.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((it) => (
              <CertificateCard key={it.course_id} it={it} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

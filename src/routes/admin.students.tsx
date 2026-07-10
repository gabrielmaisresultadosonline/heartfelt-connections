import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import {
  approveStudent,
  deleteStudent,
  listStudents,
  resendStudentEmail,
  setStudentBumps,
} from "@/lib/students.functions";

const BUMP_LABELS: Record<string, string> = {
  cilios: "Extensão de Cílios",
  sobrancelha: "Sobrancelha (+R$10)",
  vitalicio: "Vitalícias (+R$9)",
};

export const Route = createFileRoute("/admin/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const listFn = useServerFn(listStudents);
  const approveFn = useServerFn(approveStudent);
  const resendFn = useServerFn(resendStudentEmail);
  const deleteFn = useServerFn(deleteStudent);
  const bumpsFn = useServerFn(setStudentBumps);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let m = true;
    me().then((r) => {
      if (!m) return;
      if (!r.authenticated) nav({ to: "/admin/login" });
      else setReady(true);
    });
    return () => { m = false; };
  }, [me, nav]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => listFn(),
    enabled: ready,
    refetchInterval: 15000,
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;

  const students = data?.students ?? [];
  const stats = data?.stats ?? { total: 0, paid: 0, pending: 0, refunded: 0 };
  const filtered = students.filter((s) => {
    if (filter === "paid" && !(s.status === "paid" || s.status === "approved_manual")) return false;
    if (filter === "pending" && s.status !== "pending") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!s.email.includes(q) && !s.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Alunos do Curso
            </h1>
            <p className="text-sm text-rose-900/60 mt-1">Compras via InfinitePay + aprovações manuais.</p>
          </div>
          <nav className="flex gap-3 text-sm font-semibold">
            <a href="/admin" className="text-pink-700 hover:text-pink-900">Dashboard</a>
            <a href="/admin/modules" className="text-pink-700 hover:text-pink-900">Módulos</a>
            <a href="/admin/settings" className="text-pink-700 hover:text-pink-900">Configurações</a>
          </nav>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pagos" value={stats.paid} tone="green" />
          <Stat label="Pendentes" value={stats.pending} tone="yellow" />
          <Stat label="Reembolsados" value={stats.refunded} tone="gray" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-pink-100 overflow-hidden">
          <div className="p-4 border-b border-pink-100 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex gap-1 bg-pink-50 rounded-full p-1">
              {(["all", "paid", "pending"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full ${filter === k ? "bg-white shadow text-pink-700" : "text-rose-900/60"}`}
                >
                  {k === "all" ? "Todos" : k === "paid" ? "Pagos" : "Pendentes"}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="flex-1 border border-pink-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-400 outline-none"
            />
            {msg && <span className="text-xs text-green-700">{msg}</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50 text-left text-rose-900">
                <tr>
                  <th className="p-3 font-semibold">Nome</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Telefone</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Pago</th>
                  <th className="p-3 font-semibold">Comprou</th>
                  <th className="p-3 font-semibold">Bumps / Acesso</th>
                  <th className="p-3 font-semibold">Criado</th>
                  <th className="p-3 font-semibold">Email enviado</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="p-8 text-center text-rose-700/60">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="p-10 text-center text-rose-700/60">Nenhum aluno.</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="border-t border-pink-100 hover:bg-pink-50/40">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 font-mono text-xs">{s.email}</td>
                      <td className="p-3 text-xs">{s.phone ?? "—"}</td>
                      <td className="p-3"><StatusBadge status={s.status} /></td>
                      <td className="p-3 text-xs font-bold text-green-700 whitespace-nowrap">
                        {typeof s.amount === "number" ? `R$ ${(s.amount / 100).toFixed(2).replace(".", ",")}` : "—"}
                      </td>
                      <td className="p-3 text-[11px] text-rose-900/80">{inferPurchase(s.amount)}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-700">
                            <span className="inline-block w-3 h-3 rounded-sm bg-pink-600 text-white text-[9px] leading-3 text-center">✓</span>
                            Liso Perfeito
                          </span>
                          {(["cilios"] as const).map((b) => {
                            const has = s.bumps.includes(b);
                            return (
                              <label key={b} className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={has}
                                  onChange={async (e) => {
                                    const next = e.target.checked
                                      ? Array.from(new Set([...s.bumps, b]))
                                      : s.bumps.filter((x) => x !== b);
                                    await bumpsFn({ data: { id: s.id, bumps: next as ("sobrancelha" | "vitalicio" | "cilios")[] } });
                                    setMsg(`✓ Bumps atualizados para ${s.email}`);
                                    qc.invalidateQueries({ queryKey: ["admin-students"] });
                                  }}
                                  className="accent-[#d82298]"
                                />
                                <span className={has ? "font-bold text-pink-700" : "text-gray-500"}>{BUMP_LABELS[b]}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600">{new Date(s.created_at).toLocaleString("pt-BR")}</td>
                      <td className="p-3 text-xs text-gray-600">
                        {s.email_sent_at ? new Date(s.email_sent_at).toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-2">
                        {s.status === "pending" && (
                          <button
                            onClick={async () => {
                              const r = await approveFn({ data: { id: s.id } });
                              setMsg(r.ok ? `✓ ${s.email} aprovado` : `Erro: ${r.error ?? ""}`);
                              qc.invalidateQueries({ queryKey: ["admin-students"] });
                            }}
                            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full"
                          >
                            Aprovar
                          </button>
                        )}
                        {(s.status === "paid" || s.status === "approved_manual") && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Reenviar email com nova senha para ${s.email}?`)) return;
                              const r = await resendFn({ data: { id: s.id } });
                              setMsg(r.ok ? `✓ Email reenviado para ${s.email}` : `Erro: ${r.error ?? ""}`);
                              qc.invalidateQueries({ queryKey: ["admin-students"] });
                            }}
                            className="text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-full"
                          >
                            Reenviar email
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm(`Remover ${s.email}?`)) return;
                            await deleteFn({ data: { id: s.id } });
                            qc.invalidateQueries({ queryKey: ["admin-students"] });
                          }}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "green" | "yellow" | "gray" }) {
  const c = tone === "green" ? "from-green-500 to-emerald-600" : tone === "yellow" ? "from-amber-500 to-orange-500" : tone === "gray" ? "from-gray-400 to-gray-500" : "from-pink-500 to-fuchsia-600";
  return (
    <div className="bg-white rounded-2xl shadow ring-1 ring-pink-100 p-5">
      <p className="text-xs uppercase tracking-wider text-rose-900/60 font-semibold">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-r ${c} bg-clip-text text-transparent`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "bg-amber-100 text-amber-800" },
    paid: { label: "Pago", cls: "bg-green-100 text-green-800" },
    approved_manual: { label: "Aprovado manual", cls: "bg-blue-100 text-blue-800" },
    refunded: { label: "Reembolsado", cls: "bg-gray-200 text-gray-700" },
    expired: { label: "Expirado", cls: "bg-rose-100 text-rose-800" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

// Infere quais cursos foram comprados a partir do valor pago (em centavos).
// Preços: Liso Perfeito R$10, Extensão de Cílios R$13, Sobrancelha R$10.
function inferPurchase(amountCents: number | null | undefined): string {
  if (typeof amountCents !== "number" || amountCents <= 0) return "—";
  const combos: { total: number; items: string[] }[] = [
    { total: 3300, items: ["Liso Perfeito", "Cílios", "Sobrancelha"] },
    { total: 2300, items: ["Liso Perfeito", "Cílios"] },
    { total: 2000, items: ["Liso Perfeito", "Sobrancelha"] },
    { total: 1300, items: ["Cílios"] },
    { total: 1000, items: ["Liso Perfeito"] },
  ];
  const match = combos.find((c) => Math.abs(c.total - amountCents) <= 100);
  if (match) return match.items.join(" + ");
  return `R$ ${(amountCents / 100).toFixed(2).replace(".", ",")} (custom)`;
}

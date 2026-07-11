import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import {
  approveStudent,
  deleteStudent,
  listStudents,
  listRecoveryEmails,
  reconcilePendingStudents,
  resendStudentEmail,
  runRecoveryEmails,
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


type Row = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: string;
  order_nsu: string | null;
  transaction_nsu: string | null;
  invoice_slug: string | null;
  amount: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  has_password: boolean;
  email_sent_at: string | null;
  bumps: string[];
  source?: "checkout" | "kiwify";
};

type KiwifyBuyerRow = {
  email: string;
  name: string | null;
  order_id: string | null;
  status: string;
  purchased_at: string;
};

type Grouped = {
  email: string;
  name: string;
  phone: string | null;
  latest: Row;
  history: Row[]; // ordenado do mais recente para o mais antigo
  totalApprovedCents: number;
  hasPaid: boolean;
  hasPending: boolean;
  allBumps: string[];
  hasLiso: boolean;
  purchasedItems: string[]; // união de todos os cursos comprados
};

function StudentsPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const listFn = useServerFn(listStudents);
  const approveFn = useServerFn(approveStudent);
  const resendFn = useServerFn(resendStudentEmail);
  const deleteFn = useServerFn(deleteStudent);
  const bumpsFn = useServerFn(setStudentBumps);
  const reconcileFn = useServerFn(reconcilePendingStudents);
  const runRecoveryFn = useServerFn(runRecoveryEmails);
  const listRecoveryFn = useServerFn(listRecoveryEmails);
  const [reconciling, setReconciling] = useState(false);
  const [runningRecovery, setRunningRecovery] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const students: Row[] = useMemo(
    () => ((data?.students ?? []) as Row[]).map((s) => ({ ...s, source: "checkout" as const })),
    [data],
  );
  const kiwifyBuyers: KiwifyBuyerRow[] = useMemo(
    () => (data?.kiwify_buyers ?? []) as KiwifyBuyerRow[],
    [data],
  );
  const stats = data?.stats ?? { total: 0, paid: 0, pending: 0, refunded: 0, total_approved_cents: 0 };

  const grouped: Grouped[] = useMemo(() => {
    const map = new Map<string, Grouped>();
    for (const s of students) {
      const key = s.email.toLowerCase();
      const value = s.paid_amount ?? s.amount ?? 0;
      const isApproved = s.status === "paid" || s.status === "approved_manual";
      const items = inferPurchaseItems(value);
      const g = map.get(key);
      if (!g) {
        map.set(key, {
          email: s.email,
          name: s.name,
          phone: s.phone,
          latest: s,
          history: [s],
          totalApprovedCents: isApproved && value > 0 ? value : 0,
          hasPaid: isApproved,
          hasPending: s.status === "pending",
          allBumps: [...s.bumps],
          hasLiso: isApproved && items.includes("Liso Perfeito"),
          purchasedItems: isApproved ? [...items] : [],
        });
      } else {
        g.history.push(s);
        if (s.created_at > g.latest.created_at) {
          g.latest = s;
          g.name = s.name;
          g.phone = s.phone ?? g.phone;
        }
        if (isApproved && value > 0) g.totalApprovedCents += value;
        if (isApproved) g.hasPaid = true;
        if (s.status === "pending") g.hasPending = true;
        for (const b of s.bumps) if (!g.allBumps.includes(b)) g.allBumps.push(b);
        if (isApproved) {
          if (items.includes("Liso Perfeito")) g.hasLiso = true;
          for (const it of items) if (!g.purchasedItems.includes(it)) g.purchasedItems.push(it);
        }
      }
    }
    // Adiciona compras da Kiwify (migração) como itens de histórico + marca Liso Perfeito
    for (const kb of kiwifyBuyers) {
      const key = kb.email.toLowerCase();
      const g = map.get(key);
      if (!g) continue; // só mostramos histórico Kiwify se já é aluna
      const pseudo: Row = {
        id: `kiwify:${kb.order_id ?? kb.email}:${kb.purchased_at}`,
        email: kb.email,
        name: kb.name ?? g.name,
        phone: g.phone,
        status: kb.status === "paid" ? "paid" : kb.status,
        order_nsu: kb.order_id,
        transaction_nsu: null,
        invoice_slug: null,
        amount: null,
        paid_amount: null,
        paid_at: kb.purchased_at,
        created_at: kb.purchased_at,
        updated_at: kb.purchased_at,
        has_password: true,
        email_sent_at: null,
        bumps: [],
        source: "kiwify",
      };
      // evita duplicar se já existir uma linha de checkout com mesmo order_nsu
      const dup = g.history.some((h) => h.order_nsu && kb.order_id && h.order_nsu === kb.order_id);
      if (!dup) g.history.push(pseudo);
      if (kb.status === "paid") {
        g.hasLiso = true;
        for (const it of ["Liso Perfeito", "Cílios", "Sobrancelha", "Vitalícias"]) {
          if (!g.purchasedItems.includes(it)) g.purchasedItems.push(it);
        }
      }
    }
    const arr = Array.from(map.values());
    arr.sort((a, b) => b.latest.created_at.localeCompare(a.latest.created_at));
    for (const g of arr) g.history.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return arr;
  }, [students, kiwifyBuyers]);

  const filtered = grouped.filter((g) => {
    if (filter === "paid" && !g.hasPaid) return false;
    if (filter === "pending" && !g.hasPending) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!g.email.toLowerCase().includes(q) && !g.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (!ready) return <div className="min-h-screen grid place-items-center text-pink-700">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Alunos do Curso
            </h1>
            <p className="text-sm text-rose-900/60 mt-1">
              Cada linha é um aluno (agrupado por email). Clique para ver o histórico completo de compras.
            </p>
          </div>
          <nav className="flex gap-3 text-sm font-semibold">
            <a href="/admin" className="text-pink-700 hover:text-pink-900">Dashboard</a>
            <a href="/admin/modules" className="text-pink-700 hover:text-pink-900">Módulos</a>
            <a href="/admin/settings" className="text-pink-700 hover:text-pink-900">Configurações</a>
          </nav>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat label="Alunos" value={String(grouped.length)} />
          <Stat label="Pagos" value={String(stats.paid)} tone="green" />
          <Stat label="Pendentes" value={String(stats.pending)} tone="yellow" />
          <Stat label="Reembolsados" value={String(stats.refunded)} tone="gray" />
          <Stat
            label="Total aprovado"
            value={`R$ ${(stats.total_approved_cents / 100).toFixed(2).replace(".", ",")}`}
            tone="green"
          />
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
            <button
              disabled={reconciling}
              onClick={async () => {
                setReconciling(true);
                setMsg(null);
                try {
                  const r = await reconcileFn();
                  setMsg(`Verificados: ${r.checked} · Aprovados agora: ${r.approved}`);
                  qc.invalidateQueries({ queryKey: ["admin-students"] });
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : "Erro ao verificar");
                } finally {
                  setReconciling(false);
                  setTimeout(() => setMsg(null), 6000);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white text-xs font-bold shadow disabled:opacity-60"
            >
              {reconciling ? "Verificando..." : "Verificar pendentes"}
            </button>
            {msg && <span className="text-xs text-green-700">{msg}</span>}
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50 text-left text-rose-900">
                <tr>
                  <th className="p-3 w-8"></th>
                  <th className="p-3 font-semibold">Nome</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Telefone</th>
                  <th className="p-3 font-semibold">Compras</th>
                  <th className="p-3 font-semibold">Total pago</th>
                  <th className="p-3 font-semibold">Última compra</th>
                  <th className="p-3 font-semibold">Bumps / Acesso</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="p-8 text-center text-rose-700/60">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="p-10 text-center text-rose-700/60">Nenhum aluno.</td></tr>
                ) : (
                  filtered.map((g) => {
                    const key = g.email.toLowerCase();
                    const isOpen = !!expanded[key];
                    const last = g.latest;
                    return (
                      <Fragment key={key}>
                        <tr key={key} className="border-t border-pink-100 hover:bg-pink-50/40 cursor-pointer" onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}>
                          <td className="p-3 text-pink-600 font-bold text-lg select-none">{isOpen ? "▾" : "▸"}</td>
                          <td className="p-3 font-medium">{g.name}</td>
                          <td className="p-3 font-mono text-xs">{g.email}</td>
                          <td className="p-3 text-xs">{g.phone ?? "—"}</td>
                          <td className="p-3">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800">
                              {g.history.length}
                            </span>
                          </td>
                          <td className="p-3 text-xs font-bold text-green-700 whitespace-nowrap">
                            R$ {(g.totalApprovedCents / 100).toFixed(2).replace(".", ",")}
                          </td>
                          <td className="p-3 text-xs text-gray-700">
                            <div><StatusBadge status={last.status} /></div>
                            <div className="mt-1 text-gray-500">{new Date(last.created_at).toLocaleString("pt-BR")}</div>
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${g.hasLiso ? "text-pink-700" : "text-gray-400"}`}
                                title={g.hasLiso ? "Liso Perfeito comprado" : "Liso Perfeito não comprado"}
                              >
                                <span
                                  className={`inline-block w-3 h-3 rounded-sm text-white text-[9px] leading-3 text-center ${g.hasLiso ? "bg-pink-600" : "bg-gray-300"}`}
                                >
                                  {g.hasLiso ? "✓" : ""}
                                </span>
                                Liso Perfeito
                              </span>
                              {(["cilios", "sobrancelha", "vitalicio"] as const).map((b) => {
                                const itemLabel = b === "cilios" ? "Cílios" : b === "sobrancelha" ? "Sobrancelha" : "Vitalícias";
                                const has = g.allBumps.includes(b) || g.purchasedItems.includes(itemLabel);
                                return (
                                  <label key={b} className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={has}
                                      onChange={async (e) => {
                                        // Aplica a mudança em TODAS as linhas dessa pessoa (mesmo email)
                                        const nextBumps = e.target.checked
                                          ? Array.from(new Set([...g.allBumps, b]))
                                          : g.allBumps.filter((x) => x !== b);
                                        for (const r of g.history) {
                                          await bumpsFn({
                                            data: {
                                              id: r.id,
                                              bumps: nextBumps.filter((x) => x === "cilios" || x === "sobrancelha" || x === "vitalicio") as ("sobrancelha" | "vitalicio" | "cilios")[],
                                            },
                                          });
                                        }
                                        setMsg(`✓ Bumps atualizados para ${g.email}`);
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
                          <td className="p-3 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                            {last.status === "pending" && (
                              <button
                                onClick={async () => {
                                  const r = await approveFn({ data: { id: last.id } });
                                  setMsg(r.ok ? `✓ ${g.email} aprovado` : `Erro: ${r.error ?? ""}`);
                                  qc.invalidateQueries({ queryKey: ["admin-students"] });
                                }}
                                className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full"
                              >
                                Aprovar
                              </button>
                            )}
                            {g.hasPaid && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Reenviar email com nova senha para ${g.email}?`)) return;
                                  const paidRow = g.history.find((r) => r.status === "paid" || r.status === "approved_manual") ?? last;
                                  const r = await resendFn({ data: { id: paidRow.id } });
                                  setMsg(r.ok ? `✓ Email reenviado para ${g.email}` : `Erro: ${r.error ?? ""}`);
                                  qc.invalidateQueries({ queryKey: ["admin-students"] });
                                }}
                                className="text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-full"
                              >
                                Reenviar email
                              </button>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${key}-hist`} className="bg-pink-50/40">
                            <td></td>
                            <td colSpan={8} className="p-4">
                              <div className="text-[11px] uppercase tracking-wider text-rose-900/60 font-bold mb-2">
                                Histórico de compras ({g.history.length})
                              </div>
                              <div className="space-y-2">
                                {g.history.map((r, idx) => (
                                  <div key={r.id} className="bg-white rounded-xl ring-1 ring-pink-100 p-3 text-xs grid grid-cols-1 md:grid-cols-6 gap-2 items-start">
                                    <div>
                                      <div className="text-[10px] uppercase text-rose-900/50 font-bold">#{g.history.length - idx}</div>
                                      <StatusBadge status={r.status} />
                                    </div>
                                    <div>
                                      <div className="text-[10px] uppercase text-rose-900/50 font-bold">Valor</div>
                                      <div className="font-bold text-green-700">
                                        {r.source === "kiwify"
                                          ? "Kiwify"
                                          : typeof (r.paid_amount ?? r.amount) === "number"
                                            ? `R$ ${(((r.paid_amount ?? r.amount)!) / 100).toFixed(2).replace(".", ",")}`
                                            : "— (migração)"}
                                      </div>
                                      <div className="text-[11px] text-rose-900/80">
                                        {r.source === "kiwify"
                                          ? "Liso Perfeito + Cílios + Sobrancelha + Vitalícias"
                                          : inferPurchase(r.paid_amount ?? r.amount)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] uppercase text-rose-900/50 font-bold">Criado</div>
                                      <div>{new Date(r.created_at).toLocaleString("pt-BR")}</div>
                                      {r.paid_at && (
                                        <>
                                          <div className="text-[10px] uppercase text-rose-900/50 font-bold mt-1">Pago em</div>
                                          <div>{new Date(r.paid_at).toLocaleString("pt-BR")}</div>
                                        </>
                                      )}
                                    </div>
                                    <div className="md:col-span-2 font-mono text-[10px] break-all">
                                      <div className="text-[10px] uppercase text-rose-900/50 font-bold font-sans">
                                        {r.source === "kiwify" ? "Origem" : "Transação"}
                                      </div>
                                      {r.source === "kiwify" ? (
                                        <div>Kiwify • Pedido: {r.order_nsu ?? "—"}</div>
                                      ) : (
                                        <>
                                          <div>NSU: {r.order_nsu ?? "—"}</div>
                                          <div>TX: {r.transaction_nsu ?? "—"}</div>
                                          {r.invoice_slug && <div>Slug: {r.invoice_slug}</div>}
                                        </>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[10px] uppercase text-rose-900/50 font-bold">Email</div>
                                      <div>{r.email_sent_at ? new Date(r.email_sent_at).toLocaleString("pt-BR") : "—"}</div>
                                      {r.source !== "kiwify" && (
                                        <button
                                          onClick={async () => {
                                            if (!confirm(`Remover esta compra (#${g.history.length - idx}) de ${g.email}?`)) return;
                                            await deleteFn({ data: { id: r.id } });
                                            qc.invalidateQueries({ queryKey: ["admin-students"] });
                                          }}
                                          className="mt-2 text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline"
                                        >
                                          Remover
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "green" | "yellow" | "gray" }) {
  const c = tone === "green" ? "from-green-500 to-emerald-600" : tone === "yellow" ? "from-amber-500 to-orange-500" : tone === "gray" ? "from-gray-400 to-gray-500" : "from-pink-500 to-fuchsia-600";
  return (
    <div className="bg-white rounded-2xl shadow ring-1 ring-pink-100 p-5">
      <p className="text-xs uppercase tracking-wider text-rose-900/60 font-semibold">{label}</p>
      <p className={`text-2xl md:text-3xl font-extrabold mt-1 bg-gradient-to-r ${c} bg-clip-text text-transparent`}>{value}</p>
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
// Preços: Liso Perfeito R$10, Extensão de Cílios R$13, Sobrancelha R$10, Vitalícias R$9.
function inferPurchase(amountCents: number | null | undefined): string {
  if (typeof amountCents !== "number" || amountCents <= 0) return "—";
  const combos: { total: number; items: string[] }[] = [
    { total: 4200, items: ["Liso Perfeito", "Cílios", "Sobrancelha", "Vitalícias"] },
    { total: 3300, items: ["Liso Perfeito", "Cílios", "Sobrancelha"] },
    { total: 3200, items: ["Cílios", "Sobrancelha", "Vitalícias"] },
    { total: 2300, items: ["Liso Perfeito", "Cílios"] },
    { total: 2200, items: ["Cílios", "Vitalícias"] },
    { total: 2000, items: ["Liso Perfeito", "Sobrancelha"] },
    { total: 1900, items: ["Sobrancelha", "Vitalícias"] },
    { total: 1300, items: ["Cílios"] },
    { total: 1000, items: ["Liso Perfeito"] },
    { total: 1000, items: ["Sobrancelha"] },
    { total: 900, items: ["Vitalícias"] },
  ];
  const match = combos.find((c) => Math.abs(c.total - amountCents) <= 100);
  return match ? match.items.join(" + ") : `R$ ${(amountCents / 100).toFixed(2).replace(".", ",")}`;
}

export function inferPurchaseItems(amountCents: number | null | undefined): string[] {
  if (typeof amountCents !== "number" || amountCents <= 0) return [];
  const combos: { total: number; items: string[] }[] = [
    { total: 4200, items: ["Liso Perfeito", "Cílios", "Sobrancelha", "Vitalícias"] },
    { total: 3300, items: ["Liso Perfeito", "Cílios", "Sobrancelha"] },
    { total: 3200, items: ["Cílios", "Sobrancelha", "Vitalícias"] },
    { total: 2300, items: ["Liso Perfeito", "Cílios"] },
    { total: 2200, items: ["Cílios", "Vitalícias"] },
    { total: 2000, items: ["Liso Perfeito", "Sobrancelha"] },
    { total: 1900, items: ["Sobrancelha", "Vitalícias"] },
    { total: 1300, items: ["Cílios"] },
    { total: 1000, items: ["Liso Perfeito"] },
    { total: 900, items: ["Vitalícias"] },
  ];
  const match = combos.find((c) => Math.abs(c.total - amountCents) <= 100);
  return match ? [...match.items] : [];
}

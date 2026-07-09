import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminLogout, adminMe } from "@/lib/auth.functions";
import { deleteCertificate, listCertificates } from "@/lib/certificates.functions";
import { addBuyerManual, deleteBuyer, importBuyersCSV, listBuyers } from "@/lib/buyers.functions";
import { listEmailSends, sendMigrationCampaign, sendMigrationTest } from "@/lib/campaigns.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Tab = "certificates" | "buyers" | "emails";

function AdminDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const logout = useServerFn(adminLogout);
  const fetchList = useServerFn(listCertificates);
  const del = useServerFn(deleteCertificate);
  const fetchBuyers = useServerFn(listBuyers);
  const importCsv = useServerFn(importBuyersCSV);
  const delBuyer = useServerFn(deleteBuyer);
  const addManual = useServerFn(addBuyerManual);
  const fetchSends = useServerFn(listEmailSends);
  const sendCampaign = useServerFn(sendMigrationCampaign);
  const sendTest = useServerFn(sendMigrationTest);

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("certificates");
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [addingManual, setAddingManual] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  const { data: certData, isLoading: certLoading } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => fetchList(),
    enabled: ready,
  });

  const { data: buyersData, isLoading: buyersLoading } = useQuery({
    queryKey: ["admin-buyers"],
    queryFn: () => fetchBuyers(),
    enabled: ready,
  });

  const { data: sendsData, isLoading: sendsLoading } = useQuery({
    queryKey: ["admin-email-sends"],
    queryFn: () => fetchSends(),
    enabled: ready,
    refetchInterval: tab === "emails" ? 4000 : false,
  });


  if (!ready)
    return (
      <div className="min-h-screen grid place-items-center text-rose-700">Carregando...</div>
    );

  async function onCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const csvText = await f.text();
      const res = await importCsv({ data: { csvText } });
      if (!res.ok) {
        setImportMsg(`Erro: ${res.error}`);
      } else {
        setImportMsg(
          `✓ ${res.added} adicionados, ${res.updated} atualizados, ${res.skipped} ignorados (${res.total} linhas)`,
        );
        qc.invalidateQueries({ queryKey: ["admin-buyers"] });
      }
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Erro ao importar CSV");
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function onAddManual(e: React.FormEvent) {
    e.preventDefault();
    const email = manualEmail.trim().toLowerCase();
    if (!email) return;
    setAddingManual(true);
    setImportMsg(null);
    try {
      const res = await addManual({
        data: { email, name: manualName.trim() || undefined },
      });
      setImportMsg(
        res.created
          ? `✓ Email ${email} adicionado como pago`
          : `✓ Email ${email} atualizado para pago`,
      );
      setManualEmail("");
      setManualName("");
      qc.invalidateQueries({ queryKey: ["admin-buyers"] });
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Erro ao adicionar email");
    } finally {
      setAddingManual(false);
    }
  }

  const certs = certData?.certificates ?? [];
  const buyers = (buyersData?.buyers ?? []).filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.email.includes(q) || (b.name ?? "").toLowerCase().includes(q);
  });
  const stats = buyersData?.stats ?? { total: 0, paid: 0, refunded: 0, waiting: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-sm text-rose-900/60 mt-1">
              Gerencie alunas autorizadas e certificados emitidos.
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <a href="/admin/students" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Alunos</a>
            <a href="/admin/courses" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Cursos</a>
            <a href="/admin/modules" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Módulos (legado)</a>
            <a href="/admin/template" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Template</a>
            <a href="/admin/certificados" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Certificados p/ Curso</a>
            <a href="/admin/settings" className="text-sm text-pink-700 hover:text-pink-900 font-semibold">Configurações</a>
            <button
              onClick={async () => {
                await logout();
                nav({ to: "/admin/login" });
              }}
              className="text-sm text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-full font-semibold shadow"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Certificados emitidos" value={certs.length} color="pink" />
          <StatCard label="Alunas autorizadas" value={stats.paid} color="fuchsia" />
          <StatCard label="Total no banco" value={stats.total} color="rose" />
          <StatCard
            label="Reembolsadas / Chargeback"
            value={stats.refunded}
            color="gray"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <TabBtn active={tab === "certificates"} onClick={() => setTab("certificates")}>
            🎓 Certificados ({certs.length})
          </TabBtn>
          <TabBtn active={tab === "buyers"} onClick={() => setTab("buyers")}>
            👥 Alunas Kiwify ({stats.total})
          </TabBtn>
          <TabBtn active={tab === "emails"} onClick={() => setTab("emails")}>
            📧 Emails ({sendsData?.stats.sent ?? 0})
          </TabBtn>
        </div>

        {tab === "emails" && (
          <EmailsPanel
            totalPaid={stats.paid}
            sends={sendsData?.sends ?? []}
            loading={sendsLoading}
            stats={sendsData?.stats ?? { total: 0, sent: 0, failed: 0 }}
            migrationSentCount={sendsData?.migration_sent_count ?? 0}
            onSend={async (onlyNew) => {
              const res = await sendCampaign({ data: { onlyNew } });
              qc.invalidateQueries({ queryKey: ["admin-email-sends"] });
              return res;
            }}
            onTest={async (email, name) => {
              const res = await sendTest({ data: { email, name } });
              qc.invalidateQueries({ queryKey: ["admin-email-sends"] });
              return res;
            }}
          />
        )}

        {tab === "buyers" && (
          <div className="bg-white rounded-2xl shadow-xl shadow-pink-200/40 ring-1 ring-pink-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 md:p-5 border-b border-pink-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por email ou nome..."
                  className="w-full border border-pink-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                {importMsg && (
                  <span
                    className={`text-xs ${importMsg.startsWith("✓") ? "text-green-700" : "text-red-700"}`}
                  >
                    {importMsg}
                  </span>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onCsvSelected}
                  className="hidden"
                />
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={importing}
                  className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-pink-400/30 disabled:opacity-60"
                >
                  {importing ? "Importando..." : "📤 Importar CSV Kiwify"}
                </button>
              </div>
            </div>

            <div className="px-5 py-3 bg-pink-50/60 border-b border-pink-100 text-xs text-rose-900/70">
              💡 Exporte a lista de compradores da Kiwify (CSV) e suba aqui. O sistema detecta
              colunas <strong>email</strong>, <strong>nome</strong> e <strong>status</strong>{" "}
              automaticamente. Sem coluna de status, todos viram <strong>pago</strong>.
            </div>

            {/* Adicionar email manualmente */}
            <form
              onSubmit={onAddManual}
              className="px-5 py-4 bg-amber-50/60 border-b border-amber-200 flex flex-col md:flex-row gap-2 md:items-center"
            >
              <div className="text-xs text-amber-900 font-semibold md:mr-2 whitespace-nowrap">
                ➕ Adicionar email manual:
              </div>
              <input
                type="email"
                required
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="email@cliente.com"
                className="flex-1 min-w-[200px] border border-amber-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Nome (opcional)"
                className="flex-1 min-w-[160px] border border-amber-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
              <button
                type="submit"
                disabled={addingManual}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow disabled:opacity-60 whitespace-nowrap"
              >
                {addingManual ? "Adicionando..." : "Adicionar como Pago"}
              </button>
            </form>


            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 text-left text-rose-900">
                  <tr>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Nome</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Pedido</th>
                    <th className="p-3 font-semibold">Atualizado</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {buyersLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-rose-700/60">
                        Carregando...
                      </td>
                    </tr>
                  ) : buyers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-rose-700/60">
                        {search
                          ? "Nenhuma aluna encontrada com esse filtro."
                          : "Nenhuma aluna cadastrada. Importe um CSV da Kiwify acima."}
                      </td>
                    </tr>
                  ) : (
                    buyers.map((b) => (
                      <tr key={b.email} className="border-t border-pink-100 hover:bg-pink-50/40">
                        <td className="p-3 font-mono text-xs text-rose-900">{b.email}</td>
                        <td className="p-3 font-medium">{b.name ?? "—"}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-xs text-gray-600">{b.order_id ?? "—"}</td>
                        <td className="p-3 text-xs text-gray-600">
                          {new Date(b.updated_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`Remover ${b.email}?`)) return;
                              await delBuyer({ data: { email: b.email } });
                              qc.invalidateQueries({ queryKey: ["admin-buyers"] });
                            }}
                            className="text-red-600 hover:text-red-800 hover:underline text-xs font-semibold"
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
        )}

        {tab === "certificates" && (
          <div className="bg-white rounded-2xl shadow-xl shadow-pink-200/40 ring-1 ring-pink-100 overflow-hidden">
            {certLoading ? (
              <div className="p-8 text-center text-rose-700/60">Carregando lista...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-pink-50 text-left text-rose-900">
                    <tr>
                      <th className="p-3 font-semibold">Data</th>
                      <th className="p-3 font-semibold">Nome</th>
                      <th className="p-3 font-semibold">Email</th>
                      <th className="p-3 font-semibold">Foto</th>
                      <th className="p-3 font-semibold">PDF</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {certs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-rose-700/60">
                          Nenhum certificado emitido ainda.
                        </td>
                      </tr>
                    ) : (
                      certs.map((c) => (
                        <tr key={c.id} className="border-t border-pink-100 hover:bg-pink-50/40">
                          <td className="p-3 text-xs text-gray-600">
                            {new Date(c.created_at).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 font-medium">{c.full_name}</td>
                          <td className="p-3 font-mono text-xs">{c.email ?? "—"}</td>
                          <td className="p-3">
                            <a href={c.enhanced_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={c.enhanced_url}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                              />
                            </a>
                          </td>
                          <td className="p-3">
                            <a
                              href={c.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-800 font-semibold text-xs"
                            >
                              ⬇ Baixar
                            </a>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={async () => {
                                if (!confirm(`Apagar certificado de ${c.full_name}?`)) return;
                                await del({ data: { id: c.id } });
                                qc.invalidateQueries({ queryKey: ["admin-certificates"] });
                              }}
                              className="text-red-600 hover:text-red-800 hover:underline text-xs font-semibold"
                            >
                              Apagar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "pink" | "fuchsia" | "rose" | "gray";
}) {
  const colors = {
    pink: "from-pink-500 to-pink-600",
    fuchsia: "from-fuchsia-500 to-fuchsia-600",
    rose: "from-rose-500 to-rose-600",
    gray: "from-gray-400 to-gray-500",
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-pink-200/30 ring-1 ring-pink-100 p-5">
      <p className="text-xs uppercase tracking-wider text-rose-900/60 font-semibold">{label}</p>
      <p
        className={`text-3xl font-extrabold mt-1 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}
      >
        {value}
      </p>
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-t-xl text-sm font-bold transition ${
        active
          ? "bg-white text-pink-700 shadow-lg shadow-pink-200/40 ring-1 ring-pink-100 ring-b-0"
          : "text-rose-900/60 hover:text-pink-700 hover:bg-white/50"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "✓ Pago", cls: "bg-green-100 text-green-800" },
    refunded: { label: "Reembolsado", cls: "bg-orange-100 text-orange-800" },
    chargeback: { label: "Chargeback", cls: "bg-red-100 text-red-800" },
    waiting_payment: { label: "Aguardando", cls: "bg-yellow-100 text-yellow-800" },
    other: { label: "Outro", cls: "bg-gray-100 text-gray-700" },
  };
  const v = map[status] ?? map.other;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${v.cls}`}>
      {v.label}
    </span>
  );
}

type EmailSendRow = {
  id: string;
  campaign: string;
  email: string;
  name: string | null;
  subject: string;
  status: "sent" | "failed";
  error: string | null;
  sent_at: string;
};

function EmailsPanel({
  totalPaid,
  sends,
  loading,
  stats,
  migrationSentCount,
  onSend,
  onTest,
}: {
  totalPaid: number;
  sends: EmailSendRow[];
  loading: boolean;
  stats: { total: number; sent: number; failed: number };
  migrationSentCount: number;
  onSend: (onlyNew: boolean) => Promise<{ ok: true; queued: number; skipped: number; already_sent: number }>;
  onTest: (email: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [onlyNew, setOnlyNew] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [testing, setTesting] = useState(false);

  async function handleSend() {
    if (!confirm(`Disparar campanha "Seu Curso Atualizou!" para ${onlyNew ? "novos" : "TODOS"} os buyers pagos?`)) return;
    setSending(true);
    setMsg(null);
    try {
      const r = await onSend(onlyNew);
      setMsg(`✓ ${r.queued} emails na fila (envio em background, ~1 por segundo). Já enviados antes: ${r.already_sent}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao disparar");
    } finally {
      setSending(false);
    }
  }

  async function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testEmail.trim()) return;
    setTesting(true);
    setMsg(null);
    try {
      const r = await onTest(testEmail.trim(), testName.trim() || undefined);
      setMsg(r.ok ? `✓ Teste enviado para ${testEmail}` : `Erro: ${r.error}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-pink-200/40 ring-1 ring-pink-100 overflow-hidden">
      <div className="p-5 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-fuchsia-50">
        <h2 className="text-lg font-extrabold text-rose-900">📧 Campanha: Migração para Nova Área</h2>
        <p className="text-sm text-rose-900/70 mt-1">
          Envia o e-mail <em>"Seu Curso Atualizou!"</em> para as alunas Kiwify, orientando a usar
          <strong> "Esqueci a senha"</strong> na nova área de membros.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <MiniStat label="Alunas pagas" value={totalPaid} />
          <MiniStat label="Já receberam" value={migrationSentCount} />
          <MiniStat label="Enviados (total)" value={stats.sent} />
          <MiniStat label="Falhas" value={stats.failed} tone="red" />
        </div>
      </div>

      <div className="p-5 border-b border-pink-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <label className="flex items-center gap-2 text-sm text-rose-900 font-semibold">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="w-4 h-4 accent-pink-600" />
          Enviar só para quem ainda não recebeu
        </label>
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-pink-400/30 disabled:opacity-60"
        >
          {sending ? "Disparando..." : "🚀 Disparar campanha"}
        </button>
      </div>

      <form onSubmit={handleTest} className="p-5 border-b border-pink-100 bg-amber-50/40 flex flex-col md:flex-row gap-2 md:items-center">
        <div className="text-xs text-amber-900 font-bold whitespace-nowrap">🧪 Enviar teste:</div>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="seu@email.com"
          className="flex-1 min-w-[200px] border border-amber-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Nome (opcional)"
          className="flex-1 min-w-[160px] border border-amber-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={testing}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow disabled:opacity-60 whitespace-nowrap"
        >
          {testing ? "Enviando..." : "Enviar teste"}
        </button>
      </form>

      {msg && (
        <div className={`px-5 py-3 text-sm ${msg.startsWith("✓") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{msg}</div>
      )}

      <div className="p-5 border-b border-pink-100">
        <h3 className="text-sm font-extrabold text-rose-900">Histórico de envios</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-rose-900">
            <tr>
              <th className="p-3 font-semibold">Enviado em</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Nome</th>
              <th className="p-3 font-semibold">Campanha</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Erro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-rose-700/60">Carregando...</td></tr>
            ) : sends.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-rose-700/60">Nenhum envio ainda.</td></tr>
            ) : (
              sends.map((s) => (
                <tr key={s.id} className="border-t border-pink-100 hover:bg-pink-50/40">
                  <td className="p-3 text-xs text-gray-600 whitespace-nowrap">{new Date(s.sent_at).toLocaleString("pt-BR")}</td>
                  <td className="p-3 font-mono text-xs">{s.email}</td>
                  <td className="p-3 text-xs">{s.name ?? "—"}</td>
                  <td className="p-3 text-xs text-gray-600">{s.campaign}</td>
                  <td className="p-3">
                    {s.status === "sent" ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✓ Enviado</span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">✗ Falha</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-red-700 max-w-[280px] truncate" title={s.error ?? ""}>{s.error ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = "pink" }: { label: string; value: number; tone?: "pink" | "red" }) {
  const cls = tone === "red" ? "text-red-700" : "text-pink-700";
  return (
    <div className="bg-white rounded-xl ring-1 ring-pink-100 p-3">
      <div className="text-[10px] uppercase tracking-wider text-rose-900/60 font-semibold">{label}</div>
      <div className={`text-2xl font-extrabold ${cls}`}>{value}</div>
    </div>
  );
}


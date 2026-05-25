import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminMe } from "@/lib/auth.functions";
import { getSettings, updateSettings } from "@/lib/certificates.functions";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const nav = useNavigate();
  const me = useServerFn(adminMe);
  const fetchSettings = useServerFn(getSettings);
  const save = useServerFn(updateSettings);
  const [ready, setReady] = useState(false);
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    me().then((r) => {
      if (!r.authenticated) nav({ to: "/admin/login" });
      else setReady(true);
    });
  }, [me, nav]);

  const { data, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings(),
    enabled: ready,
  });

  if (!ready) return <div className="p-8">Carregando...</div>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await save({ data: { openai_api_key: key.trim() || null } });
      setMsg("Salvo!");
      setKey("");
      refetch();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/admin" className="text-sm text-blue-600 hover:underline">← Voltar</a>
        <h1 className="text-3xl font-bold my-4">Configurações</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
            <p className="text-xs text-gray-500 mb-2">
              Atual:{" "}
              {data?.openai_api_key_set ? (
                <span className="font-mono">{data.openai_api_key_preview}</span>
              ) : (
                <span className="text-red-600">não configurada</span>
              )}
            </p>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco e clique salvar pra limpar. A key fica salva no <code>db.json</code> do servidor.
            </p>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}

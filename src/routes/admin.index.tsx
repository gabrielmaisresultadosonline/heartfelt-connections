import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminLogout, adminMe } from "@/lib/auth.functions";
import { deleteCertificate, listCertificates } from "@/lib/certificates.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useServerFn(adminMe);
  const logout = useServerFn(adminLogout);
  const fetchList = useServerFn(listCertificates);
  const del = useServerFn(deleteCertificate);
  const [ready, setReady] = useState(false);

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

  const { data, isLoading } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => fetchList(),
    enabled: ready,
  });

  if (!ready) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Certificados gerados</h1>
          <div className="flex gap-3 items-center">
            <a href="/admin/template" className="text-sm text-blue-600 hover:underline">
              Configurar template
            </a>
            <button
              onClick={async () => {
                await logout();
                nav({ to: "/admin/login" });
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sair
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>Carregando lista...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Foto</th>
                  <th className="p-3">PDF</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {data?.certificates.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                    <td className="p-3 font-medium">{c.full_name}</td>
                    <td className="p-3">{c.email ?? "—"}</td>
                    <td className="p-3">
                      <a href={c.enhanced_url} target="_blank" rel="noopener noreferrer">
                        <img src={c.enhanced_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      </a>
                    </td>
                    <td className="p-3">
                      <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Baixar
                      </a>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={async () => {
                          if (!confirm(`Apagar certificado de ${c.full_name}?`)) return;
                          await del({ data: { id: c.id } });
                          qc.invalidateQueries({ queryKey: ["admin-certificates"] });
                        }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data || data.certificates.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      Nenhum certificado ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

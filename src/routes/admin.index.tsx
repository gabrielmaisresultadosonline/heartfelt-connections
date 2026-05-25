import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/external-supabase/client";
import { listCertificates } from "@/lib/certificates.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const fetchList = useServerFn(listCertificates);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.user) nav({ to: "/admin/login" });
      else setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [nav]);

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
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login" });
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sair
          </button>
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
                </tr>
              </thead>
              <tbody>
                {data?.certificates.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                    <td className="p-3 font-medium">{c.full_name}</td>
                    <td className="p-3">{c.email ?? "—"}</td>
                    <td className="p-3">
                      {c.enhanced_photo_url && (
                        <a href={c.enhanced_photo_url} target="_blank" rel="noopener noreferrer">
                          <img src={c.enhanced_photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      <a
                        href={c.certificate_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Baixar
                      </a>
                    </td>
                  </tr>
                ))}
                {(!data || data.certificates.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
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

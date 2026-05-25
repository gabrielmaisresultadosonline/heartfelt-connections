import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateCertificate } from "@/lib/certificates.functions";

export const Route = createFileRoute("/certificado")({
  head: () => ({
    meta: [
      { title: "Receba seu Certificado" },
      { name: "description", content: "Envie sua foto e nome para receber seu certificado oficial." },
    ],
  }),
  component: CertificadoPage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      resolve(s.slice(s.indexOf(",") + 1));
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function CertificadoPage() {
  const generate = useServerFn(generateCertificate);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ pdfUrl: string; enhancedPhotoUrl: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return setError("Selecione uma foto");
    if (fullName.trim().length < 2) return setError("Informe seu nome completo");
    if (file.size > 8 * 1024 * 1024) return setError("Foto muito grande (máx 8MB)");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setError("Use JPG, PNG ou WEBP");
    }
    setLoading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await generate({
        data: {
          fullName: fullName.trim(),
          email,
          photoBase64: b64,
          photoMime: file.type as "image/jpeg" | "image/png" | "image/webp",
        },
      });
      setResult({ pdfUrl: res.pdfUrl, enhancedPhotoUrl: res.enhancedPhotoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">Receba seu Certificado</h1>
        <p className="text-center text-gray-600 mb-8">
          Envie uma foto sua — a IA profissionaliza e geramos seu certificado oficial.
        </p>

        {result ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Certificado pronto!</h2>
            <img
              src={result.enhancedPhotoUrl}
              alt="Foto profissionalizada"
              className="w-48 h-48 object-cover rounded-full mx-auto mb-6 border-4 border-amber-400"
            />
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Baixar Certificado PDF
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={120}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sua foto *</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WEBP até 8MB</p>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg"
            >
              {loading ? "Processando (pode levar ~30s)..." : "Gerar meu Certificado"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

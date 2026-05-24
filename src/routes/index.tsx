import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. For sites with multiple pages (About, Services, Contact, etc.),
// create separate route files (about.tsx, services.tsx, contact.tsx) — don't put all pages in this file.

function Index() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-[#d82298] text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Curso de Cabeleireira Profissional</h1>
        <p className="text-xl md:text-2xl mb-8">Domine Alisamento, Corte e Tonalização. 60 aulas em Full HD para você lucrar muito.</p>
        <div className="bg-white text-[#d82298] p-8 rounded-lg shadow-xl inline-block">
          <p className="text-2xl font-bold mb-2">Apenas R$ 47,00</p>
          <p className="text-sm font-semibold mb-6">Acesso Vitalício</p>
          <button className="bg-[#d82298] text-white py-3 px-8 rounded-full font-bold text-lg hover:bg-[#a61a73] transition">
            Quero Me Inscrever Agora!
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-[#d82298]">Por que escolher nosso curso?</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "60 Aulas em Full HD", desc: "Conteúdo completo e detalhado passo a passo." },
            { title: "Certificado MEC", desc: "Valorize seu currículo com certificado reconhecido pelo MEC." },
            { title: "Suporte VIP", desc: "Grupo exclusivo com fornecedores, dicas e estratégias de vendas." }
          ].map((b, i) => (
            <div key={i} className="text-center p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#d82298]">O que você vai aprender</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Alisamento", "Corte", "Tonalização"].map((m, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-md border-b-4 border-[#d82298]">
                <h3 className="text-2xl font-bold text-[#d82298] mb-4">{m}</h3>
                <p>Domine todas as técnicas essenciais para se destacar no mercado da beleza.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Curso de Cabeleireira. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

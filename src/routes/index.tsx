import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const images = {
    lisos: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=800",
    corte: "https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=800",
    tonalizacao: "https://images.unsplash.com/photo-1634449595524-da6de2960687?auto=format&fit=crop&q=80&w=800",
    hero: "https://images.unsplash.com/photo-1560869713-7d0a29430039?auto=format&fit=crop&q=80&w=1200",
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#d82298', color: 'white', padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>CURSO CABELEIREIRA PROFISSIONAL</h1>
        <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto 40px' }}>
          Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas.
        </p>
        <button style={{ backgroundColor: 'white', color: '#d82298', padding: '20px 40px', border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
          MATRICULE-SE AGORA
        </button>
        <div style={{ marginTop: '40px' }}>
           <img src={images.hero} alt="Hair" style={{ maxWidth: '100%', height: 'auto', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} />
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#d82298', marginBottom: '60px' }}>O QUE VOCÊ VAI APRENDER</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { title: 'Alisamento', img: images.lisos },
            { title: 'Cortes', img: images.corte },
            { title: 'Tonalização', img: images.tonalizacao }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: '300px', objectFit: 'crop' }} />
              <div style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{item.title}</h3>
                <p>Técnicas profissionais explicadas passo a passo.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus */}
      <section style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>BÔNUS EXCLUSIVOS</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.2rem', lineHeight: '2' }}>
          <li>✅ Certificado MEC Incluso</li>
          <li>✅ Grupo VIP com Fornecedores</li>
          <li>✅ Dicas de Vendas e Estratégia</li>
          <li>✅ Acesso Vitalício por R$ 47</li>
        </ul>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        <p>&copy; 2026 Professional Hair Course</p>
      </footer>
    </div>
  );
}
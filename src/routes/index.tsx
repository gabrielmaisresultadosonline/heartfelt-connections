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
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'sans-serif', margin: 0 }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#d82298', color: 'white', padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase' }}>CURSO CABELEIREIRA PROFISSIONAL</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>
          Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos.
        </p>
        <div style={{ marginBottom: '50px' }}>
          <button style={{ backgroundColor: 'white', color: '#d82298', padding: '20px 40px', border: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            GARANTIR MINHA VAGA - R$ 47
          </button>
        </div>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
           <img src={images.hero} alt="Hair" style={{ width: '100%', height: 'auto', borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }} />
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#d82298', marginBottom: '60px', fontWeight: '900' }}>MÓDULOS DO CURSO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {[
            { title: 'Alisamento Perfeito', img: images.lisos, desc: 'Técnicas de progressiva e selagem profissional.' },
            { title: 'Cortes Geométricos', img: images.corte, desc: 'Cortes modernos e tendências atuais.' },
            { title: 'Tonalização Expert', img: images.tonalizacao, desc: 'Colorimetria avançada para resultados incríveis.' }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
              <div style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus / Benefits */}
      <section style={{ backgroundColor: '#111', color: 'white', padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '50px', fontWeight: '900' }}>BÔNUS EXCLUSIVOS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#d82298' }}>CERTIFICADO</h4>
              <p>Reconhecido pelo MEC</p>
            </div>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#d82298' }}>GRUPO VIP</h4>
              <p>Com Fornecedores</p>
            </div>
            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#d82298' }}>SUPORTE</h4>
              <p>Direto com instrutor</p>
            </div>
          </div>
          <p style={{ marginTop: '60px', fontSize: '1.5rem', fontWeight: 'bold' }}>Tudo isso com Acesso Vitalício por apenas <span style={{ color: '#d82298' }}>R$ 47,00</span></p>
          <button style={{ marginTop: '30px', backgroundColor: '#d82298', color: 'white', padding: '20px 50px', border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
            QUERO COMEÇAR HOJE
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa', backgroundColor: '#fafafa', borderTop: '1px solid #eee' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>&copy; 2026 PROFESSIONAL HAIR COURSE</p>
        <p style={{ fontSize: '0.8rem' }}>Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
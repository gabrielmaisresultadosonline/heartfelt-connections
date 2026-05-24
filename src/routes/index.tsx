import { createFileRoute } from "@tanstack/react-router";
import { Scissors, Award, Users, Video, ShoppingBag, CheckCircle } from "lucide-react";

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

  const sectionStyle = {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as const
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#d82298', color: 'white', padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase' }}>Curso Cabeleireira Profissional</h1>
        <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>
          Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos.
        </p>
        <button style={{ backgroundColor: 'white', color: '#d82298', padding: '20px 40px', border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '60px' }}>
          GARANTIR MINHA VAGA - R$ 47
        </button>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
           <img src={images.hero} alt="Hair" style={{ width: '100%', height: 'auto', borderRadius: '24px', border: '8px solid rgba(255,255,255,0.2)' }} />
        </div>
      </section>

      {/* Modules */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#d82298', marginBottom: '60px', fontWeight: '900' }}>O QUE VOCÊ VAI DOMINAR</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { title: 'Alisamento', img: images.lisos, desc: 'Técnicas de progressiva e selagem profissional.' },
            { title: 'Cortes', img: images.corte, desc: 'Cortes modernos e tendências atuais.' },
            { title: 'Tonalização', img: images.tonalizacao, desc: 'Colorimetria avançada para resultados incríveis.' }
          ].map((item, i) => (
            <div key={i} style={cardStyle}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
              <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>{item.desc}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#d82298', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <CheckCircle size={18} /> <span>PRÁTICA REAL</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section style={{ backgroundColor: '#111', color: 'white', padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '50px', fontWeight: '900' }}>BÔNUS <span style={{ color: '#d82298' }}>EXCLUSIVOS</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { icon: Award, title: "Certificado MEC" },
              { icon: Users, title: "Comunidade VIP" },
              { icon: ShoppingBag, title: "Fornecedores" },
              { icon: Video, title: "Aulas Extras" }
            ].map((bonus, i) => (
              <div key={i} style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ backgroundColor: '#d82298', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <bonus.icon size={30} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{bonus.title}</h4>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '60px', fontSize: '1.8rem', fontWeight: 'bold' }}>Tudo isso com Acesso Vitalício por apenas <span style={{ color: '#d82298' }}>R$ 47,00</span></p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', color: '#d82298' }}>
          <Scissors size={24} />
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>PROFESSIONAL HAIR</span>
        </div>
        <p>&copy; 2026 Professional Hair Course - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
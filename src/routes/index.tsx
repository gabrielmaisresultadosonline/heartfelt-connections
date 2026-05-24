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
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", color: "#1a1a1a", fontFamily: "sans-serif" }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: "#d82298", color: "white", padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase" }}>Curso Cabeleireira Profissional</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto 30px" }}>
          Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos.
        </p>
        <button style={{ backgroundColor: "white", color: "#d82298", padding: "15px 30px", border: "none", borderRadius: "30px", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", marginBottom: "40px" }}>
          GARANTIR MINHA VAGA - R$ 47
        </button>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
           <img src={images.hero} alt="Curso de Cabelo" style={{ width: "100%", height: "auto", borderRadius: "20px", border: "4px solid rgba(255,255,255,0.2)" }} />
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: "60px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", color: "#d82298", marginBottom: "40px", fontWeight: "900" }}>O QUE VOCÊ VAI DOMINAR</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          {[
            { title: "Alisamento", img: images.lisos, desc: "Técnicas de progressiva e selagem." },
            { title: "Cortes", img: images.corte, desc: "Cortes modernos e tendências." },
            { title: "Tonalização", img: images.tonalizacao, desc: "Colorimetria avançada profissional." }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 5px 20px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
              <div style={{ padding: "25px" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>{item.title}</h3>
                <p style={{ color: "#666", fontSize: "0.95rem" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus */}
      <section style={{ backgroundColor: "#111", color: "white", padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "40px", fontWeight: "900" }}>BÔNUS EXCLUSIVOS</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", maxWidth: "1000px", margin: "0 auto" }}>
          {["Certificado MEC", "Grupo VIP", "Fornecedores", "Aulas Extras"].map((bonus, i) => (
            <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "15px", flex: "1 1 200px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#d82298" }}>{bonus}</h4>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "40px", fontSize: "1.4rem", fontWeight: "bold" }}>Acesso Vitalício: <span style={{ color: "#d82298" }}>R$ 47,00</span></p>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: "0.9rem" }}>
        <p style={{ color: "#d82298", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "10px" }}>PROFESSIONAL HAIR</p>
        <p>&copy; 2026 Professional Hair Course</p>
      </footer>
    </div>
  );
}
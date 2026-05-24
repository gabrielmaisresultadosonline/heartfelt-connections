import { createFileRoute } from "@tanstack/react-router";
import { Award, Users, Video, ShoppingBag, CheckCircle, Scissors } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const images = {
    lisos: "https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=800",
    corte: "https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800",
    tonalizacao: "https://images.pexels.com/photos/3738339/pexels-photo-3738339.jpeg?auto=compress&cs=tinysrgb&w=800",
    hero: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1200",
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", color: "#1a1a1a", fontFamily: "sans-serif", margin: 0, padding: 0 }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: "#d82298", color: "white", padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase", lineHeight: "1.1" }}>Curso Cabeleireira Profissional</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto 30px", opacity: 0.9 }}>
          Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos.
        </p>
        <button style={{ backgroundColor: "white", color: "#d82298", padding: "18px 36px", border: "none", borderRadius: "50px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", marginBottom: "50px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          GARANTIR MINHA VAGA - R$ 47
        </button>
        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
           <img src={images.hero} alt="Curso Profissional" style={{ width: "100%", height: "auto", borderRadius: "20px", border: "6px solid rgba(255,255,255,0.2)", display: "block", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }} />
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: "80px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.2rem", color: "#d82298", marginBottom: "45px", fontWeight: "900", textTransform: "uppercase" }}>O que você vai dominar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          {[
            { title: "Alisamento Profissional", img: images.lisos, desc: "Técnicas avançadas de progressiva e selagem." },
            { title: "Cortes e Camadas", img: images.corte, desc: "Técnicas modernas de corte para todos os estilos." },
            { title: "Tonalização de Elite", img: images.tonalizacao, desc: "Colorimetria avançada sem erros." }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.06)", border: "1px solid #eee", display: "flex", flexDirection: "column" }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", height: "280px", objectFit: "cover" }} />
              <div style={{ padding: "30px", flexGrow: 1 }}>
                <h3 style={{ fontSize: "1.6rem", fontWeight: "900", marginBottom: "12px", color: "#1a1a1a" }}>{item.title}</h3>
                <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.5" }}>{item.desc}</p>
                <div style={{ marginTop: "20px", color: "#d82298", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase" }}>
                   ✓ Prática Real em Salão
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section style={{ backgroundColor: "#111", color: "white", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "45px", fontWeight: "900", textTransform: "uppercase" }}>Bônus Exclusivos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
            {[
              { icon: Award, title: "Certificado MEC" },
              { icon: Users, title: "Grupo VIP" },
              { icon: ShoppingBag, title: "Fornecedores" },
              { icon: Video, title: "Aulas Extras" }
            ].map((bonus, i) => (
              <div key={i} style={{ padding: "25px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ backgroundColor: "#d82298", width: "50px", height: "50px", borderRadius: "12px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <bonus.icon size={24} />
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{bonus.title}</h4>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "50px", fontSize: "1.6rem", fontWeight: "900" }}>Acesso Vitalício: <span style={{ color: "#d82298" }}>R$ 47,00</span></p>
          <button style={{ marginTop: "30px", backgroundColor: "#d82298", color: "white", padding: "18px 45px", border: "none", borderRadius: "50px", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase" }}>Matricule-se Agora</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "50px 20px", textAlign: "center", color: "#888", borderTop: "1px solid #eee", backgroundColor: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
          <Scissors size={20} color="#d82298" />
          <p style={{ color: "#d82298", fontWeight: "900", fontSize: "1.3rem", textTransform: "uppercase", margin: 0 }}>Professional Hair</p>
        </div>
        <p style={{ fontSize: "0.85rem" }}>&copy; 2026 Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
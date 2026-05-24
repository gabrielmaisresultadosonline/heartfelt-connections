import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, Video, ShoppingBag, Gift, CheckCircle } from "lucide-react";

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
    <div className="bg-[#fafafa] min-h-screen text-gray-900 font-sans">
      {/* Hero Section */}
      <section className="bg-[#d82298] text-white py-24 px-6 text-center overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tighter italic">CURSO CABELEIREIRA PROFISSIONAL</h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
              Domine Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos.
            </p>
            <button className="bg-white text-[#d82298] py-6 px-12 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-all uppercase mb-16">
              GARANTIR MINHA VAGA - R$ 47
            </button>
            <div className="max-w-4xl mx-auto">
               <img src={images.hero} alt="Hair" className="rounded-3xl shadow-2xl w-full border-8 border-white/20" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-32 px-6 container mx-auto">
        <h2 className="text-center text-4xl md:text-6xl font-black text-[#d82298] mb-20 uppercase tracking-tighter italic">O QUE VOCÊ VAI DOMINAR</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: 'Alisamento', img: images.lisos, desc: 'Técnicas de progressiva e selagem profissional.' },
            { title: 'Cortes', img: images.corte, desc: 'Cortes modernos e tendências atuais.' },
            { title: 'Tonalização', img: images.tonalizacao, desc: 'Colorimetria avançada para resultados incríveis.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col h-full"
            >
              <img src={item.img} alt={item.title} className="w-full h-80 object-cover" />
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 mb-8">{item.desc}</p>
                <div className="mt-auto flex items-center gap-2 text-[#d82298] font-bold uppercase text-xs">
                  <CheckCircle size={16} /> <span>Prática Real</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section className="bg-black text-white py-32 px-6 overflow-hidden">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-20 uppercase tracking-tighter italic">BÔNUS <span className="text-[#d82298]">EXCLUSIVOS</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Certificado MEC" },
              { icon: Users, title: "Comunidade VIP" },
              { icon: ShoppingBag, title: "Fornecedores" },
              { icon: Gift, title: "Dicas Vendas" }
            ].map((bonus, i) => (
              <div key={i} className="bg-white/5 p-10 rounded-3xl border border-white/5 flex flex-col items-center">
                <div className="bg-[#d82298] p-4 rounded-2xl mb-6">
                  <bonus.icon size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tighter">{bonus.title}</h4>
              </div>
            ))}
          </div>
          <p className="text-3xl font-black mt-20 uppercase italic tracking-tighter">Acesso Vitalício por apenas <span className="text-[#d82298]">R$ 47,00</span></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.4em]">&copy; 2026 Professional Hair Course - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
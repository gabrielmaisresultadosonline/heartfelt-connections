import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, Video, Zap, CheckCircle, Star, Sparkles, Gift, ShoppingBag, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const images = {
    lisos: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=800",
    corte: "https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=800",
    tonalizacao: "https://images.unsplash.com/photo-1634449595524-da6de2960687?auto=format&fit=crop&q=80&w=800",
    hero: "https://images.unsplash.com/photo-1560869713-7d0a29430039?auto=format&fit=crop&q=80&w=1200",
    certificate: "https://images.unsplash.com/photo-1606761560479-66467f8b2fdb?auto=format&fit=crop&q=80&w=800"
  };

  return (
    <div className="bg-[#fafafa] min-h-screen text-gray-900 font-sans relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-[#d82298] overflow-hidden min-h-[90vh] flex items-center">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-20 text-white text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-widest text-white">O curso nº 1 do Brasil</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white">
              DOMINE A ARTE <br/>
              <span className="text-white/80">DAS TESOURAS</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-xl font-light mx-auto lg:mx-0">
              60 aulas gravadas de cursos físicos reais em Full HD. Certificado MEC incluso.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <button className="bg-white text-[#d82298] py-6 px-12 rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 transition-all uppercase italic tracking-tighter">
                Garantir Minha Vaga
              </button>
              <div className="text-center lg:text-left">
                <p className="text-4xl font-black tracking-tighter leading-none">R$ 47</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>

          <div className="relative hidden lg:block">
             <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <img src={images.hero} alt="Curso" className="rounded-[4rem] border-[12px] border-white/20 shadow-2xl w-full object-cover aspect-[4/5]" />
            </motion.div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-400 rounded-full blur-[120px] opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section className="py-32 px-6 container mx-auto bg-white relative z-30 -mt-10 rounded-[5rem] shadow-xl">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter italic">O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span></h2>
          <p className="text-xl text-gray-500 font-light">Técnicas profissionais explicadas passo a passo em alta definição.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { img: images.lisos, title: "Alisamento", tag: "Mais Vendido" },
            { img: images.corte, title: "Cortes", tag: "Expert" },
            { img: images.tonalizacao, title: "Tonalização", tag: "Exclusivo" }
          ].map((item, i) => (
            <div key={i} className="bg-[#fafafa] rounded-[3rem] overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full">
              <div className="h-80 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-8 left-8 bg-[#d82298] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">{item.tag}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">{item.title}</h3>
                <div className="mt-auto flex items-center gap-3 text-[#d82298] font-black uppercase text-xs tracking-widest border-t border-gray-100 pt-6">
                  <CheckCircle size={20} /> <span>Prática Real</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-32 px-6 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-20 uppercase tracking-tighter italic">BÔNUS <span className="text-[#d82298]">EXCLUSIVOS</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Certificado MEC" },
              { icon: Users, title: "Comunidade VIP" },
              { icon: ShoppingBag, title: "Fornecedores" },
              { icon: Gift, title: "Dicas Vendas" }
            ].map((bonus, i) => (
              <div key={i} className="bg-white/5 p-10 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                <div className="bg-[#d82298] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <bonus.icon size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tighter">{bonus.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="py-32 px-6 text-center bg-[#fafafa]">
        <h2 className="text-6xl md:text-8xl font-black mb-12 uppercase tracking-tighter leading-[0.8] italic">A HORA DE MUDAR <br/> <span className="text-[#d82298]">É AGORA.</span></h2>
        <button className="bg-[#d82298] text-white py-8 px-16 rounded-[3rem] font-black text-3xl md:text-5xl shadow-[0_30px_70px_rgba(216,34,152,0.5)] uppercase italic tracking-tighter">
          QUERO ME INSCREVER
        </button>
        <p className="mt-20 text-xs text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2026 Professional Hair Course</p>
      </footer>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Sparkles, Gift, Zap, ShieldCheck } from "lucide-react";

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
    <div style={{ position: 'relative', zIndex: 1 }} className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans overflow-x-hidden">

      {/* Dynamic Animated Scissors - Professional Floating Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: [0, 360], 
            x: ["-10vw", "110vw"],
            y: ["10vh", "30vh", "10vh"] 
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute opacity-10 text-[#d82298]"
        >
          <Scissors size={80} />
        </motion.div>
        <motion.div
          animate={{ 
            rotate: [-360, 0], 
            x: ["110vw", "-10vw"],
            y: ["70vh", "50vh", "70vh"] 
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="absolute opacity-10 text-pink-400"
        >
          <Scissors size={100} />
        </motion.div>
        <motion.div
           animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
           transition={{ repeat: Infinity, duration: 5 }}
           className="absolute top-1/4 left-1/4 text-pink-200"
        >
          <Sparkles size={150} />
        </motion.div>
      </div>

      {/* Hero Section - High Impact Premium Design */}
      <section className="relative pt-24 pb-20 px-6 bg-gradient-to-br from-[#d82298] via-[#e945a9] to-[#b01b7a] overflow-hidden min-h-[90vh] flex items-center shadow-[inset_0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Formação Profissional de Elite</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
              DOMINE A ARTE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">DOS CABELOS</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-xl font-light leading-relaxed mx-auto lg:mx-0">
              Aprenda Alisamento, Corte e Tonalização com 60 aulas reais gravadas de cursos físicos. 
              <span className="font-black block mt-4 text-white text-3xl italic">Certificado MEC Incluso.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#d82298] py-6 px-12 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-gray-50 transition-all uppercase italic tracking-tighter"
              >
                Garantir Minha Vaga
              </motion.button>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20 text-center lg:text-left">
                <p className="text-4xl font-black tracking-tighter leading-none text-white">R$ 47</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden border-[12px] border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
              <img src={images.hero} alt="Profissional Hair" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 text-white text-center">
                <p className="text-2xl font-black uppercase italic tracking-tighter">Aulas 100% Práticas e Reais</p>
              </div>
            </div>
            {/* Decorative colored blobs */}
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-pink-400 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-500 rounded-full blur-[120px] opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Mastery Modules - Complex Professional Grid */}
      <section className="py-32 px-6 container mx-auto bg-white relative z-30 -mt-10 rounded-[5rem] shadow-2xl mb-20 border border-gray-100">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-7xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter">O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span></h2>
          <div className="w-24 h-2 bg-[#d82298] mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-500 font-light tracking-tight">Técnicas de salão explicadas passo a passo em alta definição.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { img: images.lisos, title: "Alisamento", tag: "Campeão de Vendas", desc: "Progressivas, selagens e blindagens capilares com brilho espelhado." },
            { img: images.corte, title: "Corte Expert", tag: "Nível Master", desc: "As principais técnicas de corte e visagismo do mercado atual." },
            { img: images.tonalizacao, title: "Colorimetria", tag: "Especialização", desc: "Domine tons e tonalidades sem manchar ou danificar os fios." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -15 }}
              className="bg-[#fafafa] rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col h-full group"
            >
              <div className="h-96 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute top-8 left-8 bg-[#d82298] text-white text-[10px] font-black uppercase px-5 py-2 rounded-full shadow-lg tracking-widest">{item.tag}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter text-[#1a1a1a]">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-3 text-[#d82298] font-black uppercase text-xs tracking-widest border-t border-gray-100 pt-8">
                  <CheckCircle size={20} /> <span>100% Prática Real</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium Bonus Section - Dark & Impactful */}
      <section className="bg-black text-white py-40 px-6 relative overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#d82298] skew-x-[-15deg] translate-x-1/3 opacity-10"></div>
        <div className="container mx-auto relative z-10 text-center">
          <motion.h2 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-5xl md:text-8xl font-black mb-24 uppercase tracking-tighter italic text-white"
          >
            BÔNUS <span className="text-[#d82298]">EXCLUSIVOS</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Certificado MEC", desc: "Válido em todo Brasil" },
              { icon: Users, title: "Comunidade VIP", desc: "Suporte de Alunas" },
              { icon: ShoppingBag, title: "Fornecedores", desc: "Melhores preços" },
              { icon: Gift, title: "Dicas Vendas", desc: "Lote sua agenda" }
            ].map((bonus, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center transition-all shadow-2xl backdrop-blur-xl"
              >
                <div className="bg-[#d82298] p-5 rounded-2xl mb-8 shadow-[0_0_30px_rgba(216,34,152,0.3)]">
                  <bonus.icon size={36} className="text-white" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{bonus.title}</h4>
                <p className="opacity-40 text-sm font-bold uppercase tracking-widest">{bonus.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-32 p-12 rounded-[4rem] border border-white/10 bg-white/5 inline-block backdrop-blur-sm"
          >
             <Zap size={48} className="mx-auto text-[#d82298] mb-6 animate-pulse" />
             <p className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Acesso Vitalício por <span className="text-[#d82298]">R$ 47,00</span></p>
             <p className="mt-4 opacity-40 font-bold uppercase tracking-[0.3em]">Aproveite o preço promocional agora!</p>
          </motion.div>
        </div>
      </section>

      {/* Guarantee Badge Section */}
      <section className="py-32 px-6 container mx-auto text-center relative z-20">
         <div className="bg-white p-20 md:p-32 rounded-[5rem] shadow-2xl border border-gray-50 flex flex-col items-center">
            <ShieldCheck size={100} className="text-[#d82298] mb-10" />
            <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-none italic">7 DIAS DE <span className="text-[#d82298]">GARANTIA TOTAL</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Se você não gostar do curso, devolvemos 100% do seu dinheiro. Simples assim.</p>
         </div>
      </section>

      {/* Final CTA - Ultra Premium */}
      <footer className="py-40 px-6 text-center bg-[#fafafa] relative z-30">
        <h2 className="text-6xl md:text-[10rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic text-[#1a1a1a]">MUDE SUA <br/> <span className="text-[#d82298]">VIDA HOJE.</span></h2>
        <motion.button 
           whileHover={{ scale: 1.1, rotate: -1 }}
           whileTap={{ scale: 0.95 }}
           className="bg-[#d82298] text-white py-10 px-20 rounded-[3.5rem] font-black text-3xl md:text-5xl shadow-[0_40px_80px_rgba(216,34,152,0.5)] uppercase italic tracking-tighter inline-block"
        >
          QUERO COMEÇAR AGORA!
        </motion.button>
        
        <div className="mt-24 flex items-center justify-center gap-6 opacity-30">
           <div className="bg-gray-900 w-16 h-1 w-16 h-1 rounded-full"></div>
           <p className="text-sm font-black uppercase tracking-[0.5em] text-gray-400">Professional Hair Course</p>
           <div className="bg-gray-900 w-16 h-1 w-16 h-1 rounded-full"></div>
        </div>
        <p className="mt-10 text-[10px] text-gray-300 font-black uppercase tracking-[0.5em]">&copy; 2026 TODOS OS DIREITOS RESERVADOS</p>
      </footer>
    </div>
  );
}
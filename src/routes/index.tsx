import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Scissors, Award, Users, Video, ShoppingBag, CheckCircle, Star, Sparkles, Gift, Zap, ShieldCheck, Heart } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const images = {
    lisos: "https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=800",
    corte: "https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800",
    tonalizacao: "https://images.pexels.com/photos/3738339/pexels-photo-3738339.jpeg?auto=compress&cs=tinysrgb&w=800",
    hero: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=1200",
    certificate: "https://images.unsplash.com/photo-1606761560479-66467f8b2fdb?auto=format&fit=crop&q=80&w=800"
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ 
            rotate: [0, 360], 
            x: ["-10vw", "110vw"],
            y: ["10vh", "90vh", "10vh"] 
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute opacity-10 text-[#d82298]"
        >
          <Scissors size={120} />
        </motion.div>
        <motion.div
          animate={{ 
            rotate: [-360, 0], 
            x: ["110vw", "-10vw"],
            y: ["80vh", "20vh", "80vh"] 
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute opacity-10 text-pink-500"
        >
          <Scissors size={150} />
        </motion.div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#d82298]/10 via-black to-black opacity-50"></div>
      </div>

      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-tr from-[#d82298] to-pink-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(216,34,152,0.4)]">
              <Scissors className="text-white" size={22} />
            </div>
            <span className="font-black text-2xl italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">PROFESSIONAL HAIR</span>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#d82298] hover:text-white transition-all shadow-xl"
          >
            Matricule-se Agora
          </motion.button>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden min-h-screen flex items-center z-10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full mb-10 border border-white/10">
              <Sparkles size={18} className="text-[#d82298] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-pink-200">A Formação de Elite Nº 1</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter">
              DOMINE A ARTE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d82298] via-pink-400 to-white">DAS TESOURAS</span>
            </h1>
            <p className="text-xl md:text-3xl mb-14 opacity-70 max-w-xl font-light leading-relaxed">
              60 aulas reais gravadas de cursos físicos presenciais. <br/>
              <span className="font-black text-[#d82298] block mt-4 text-4xl">Certificado MEC Incluso.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center lg:items-start">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5, boxShadow: "0 30px 60px rgba(216,34,152,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#d82298] text-white py-8 px-16 rounded-[2.5rem] font-black text-3xl shadow-[0_20px_50px_rgba(216,34,152,0.3)] transition-all uppercase italic tracking-tighter"
              >
                Quero Minha Vaga
              </motion.button>
              <div className="text-center lg:text-left bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="text-5xl font-black tracking-tighter text-white">R$ 47</p>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#d82298] mt-1">Acesso Vitalício</p>
              </div>
            </div>

            <div className="mt-16 flex items-center gap-6 opacity-60">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-12 h-12 rounded-full border-2 border-[#d82298]" />)}
               </div>
               <p className="text-sm font-bold tracking-tight italic">Junte-se a +5.000 alunas lucrando alto</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[5rem] overflow-hidden border-[15px] border-white/5 shadow-[0_0_100px_rgba(216,34,152,0.3)]">
              <img src={images.hero} alt="Professional" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            {/* Artistic Blobs */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#d82298] rounded-full blur-[150px] opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500 rounded-full blur-[120px] opacity-20"></div>
          </motion.div>
        </div>
      </section>

      {/* Mastery Modules with Hover Effects */}
      <section className="py-40 px-6 container mx-auto relative z-20">
        <div className="text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-8xl font-black mb-6 uppercase italic tracking-tighter text-white"
          >
            O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span>
          </motion.h2>
          <div className="w-32 h-2 bg-[#d82298] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-16">
          {[
            { title: "Alisamento", img: images.lisos, tag: "Nível Master", desc: "Técnicas de progressiva, selagem e blindagem para um liso espelhado perfeito." },
            { title: "Corte", img: images.corte, tag: "Expert", desc: "Cortes modernos, camadas e as tendências das passarelas internacionais." },
            { title: "Tonalização", img: images.tonalizacao, tag: "Colorimetria", desc: "Domine a criação de cores sem manchar ou danificar os fios da cliente." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -20, scale: 1.02 }}
              className="bg-white/5 rounded-[4rem] overflow-hidden border border-white/5 group shadow-2xl backdrop-blur-xl h-full flex flex-col"
            >
              <div className="h-[450px] overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-10 left-10 bg-[#d82298] text-white text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-lg tracking-widest">{item.tag}</div>
              </div>
              <div className="p-12 flex flex-col flex-grow">
                <h3 className="text-4xl font-black mb-6 uppercase italic tracking-tighter">{item.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed mb-10 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-4 text-[#d82298] font-black uppercase text-xs tracking-widest border-t border-white/5 pt-10">
                  <CheckCircle size={22} /> <span>Prática Real em Salão</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* High-Impact Bonus Section */}
      <section className="bg-black py-40 px-6 relative overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#d82298]/20 to-transparent"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-6xl md:text-8xl font-black mb-16 uppercase leading-none tracking-tighter italic">BÔNUS QUE <br/> <span className="text-[#d82298]">LUCRAM MAIS</span></h2>
              
              <div className="grid gap-8">
                {[
                  { icon: Award, title: "Certificado MEC", desc: "Reconhecimento oficial em todo Brasil." },
                  { icon: ShoppingBag, title: "Lista Fornecedores", desc: "Os produtos que os profissionais usam." },
                  { icon: Users, title: "Grupo VIP Alunas", desc: "Comunidade para dúvidas e parcerias." },
                  { icon: Gift, title: "Estratégia Vendas", desc: "Como lotar sua agenda do absoluto zero." }
                ].map((bonus, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 20, backgroundColor: "rgba(216, 34, 152, 0.1)" }}
                    className="flex gap-8 items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/5 transition-all"
                  >
                    <div className="bg-[#d82298] p-5 rounded-2xl shadow-xl">
                      <bonus.icon size={30} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-white">{bonus.title}</h4>
                      <p className="opacity-40 text-sm">{bonus.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="rounded-[4rem] overflow-hidden border-[15px] border-white/5 shadow-[0_0_100px_rgba(216,34,152,0.4)]">
                <img src={images.certificate} alt="Certificado" className="w-full" />
              </div>
              <div className="absolute -bottom-16 -right-16 bg-white text-black p-14 rounded-[3.5rem] shadow-2xl hidden md:block">
                <ShieldCheck size={64} className="text-[#d82298] mb-6" />
                <p className="font-black text-3xl tracking-tighter uppercase italic leading-none">VÁLIDO EM<br/>TODO BRASIL</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guarantee Badge */}
      <section className="py-40 px-6 container mx-auto text-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-transparent p-20 md:p-32 rounded-[5rem] border border-white/10 relative overflow-hidden"
        >
          <Zap size={100} className="mx-auto text-[#d82298] mb-12 animate-pulse shadow-2xl" />
          <h2 className="text-5xl md:text-8xl font-black mb-10 uppercase tracking-tighter leading-none italic">Sua Satisfação ou <br/> <span className="text-[#d82298]">Seu Dinheiro de Volta</span></h2>
          <p className="text-2xl text-white/50 mb-16 max-w-3xl mx-auto font-light leading-relaxed">
            Você tem 7 dias de garantia total. Sem perguntas, sem burocracia. Se o curso não for o que você esperava, devolvemos cada centavo.
          </p>
          <div className="flex justify-center gap-10 opacity-30">
            <Heart size={48} />
            <ShieldCheck size={48} />
            <Award size={48} />
          </div>
        </motion.div>
      </section>

      {/* Grand Final CTA */}
      <section className="py-40 px-6 text-center relative z-20 bg-white text-black rounded-t-[6rem]">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            className="text-7xl md:text-[12rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic"
          >
            NÃO PERCA <br/> <span className="text-[#d82298]">SUA VAGA</span>
          </motion.h2>
          <p className="text-3xl md:text-5xl font-black mb-20 max-w-4xl mx-auto uppercase tracking-tighter opacity-20 italic">A oferta de R$ 47 é por tempo limitado</p>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#d82298] text-white py-10 px-20 rounded-[3rem] font-black text-4xl md:text-6xl shadow-[0_40px_80px_rgba(216,34,152,0.4)] uppercase italic tracking-tighter inline-block"
          >
            Quero Me Inscrever Hoje!
          </motion.button>
          
          <div className="mt-32 flex flex-wrap items-center justify-center gap-20 opacity-20 grayscale scale-125">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-12" />
          </div>
        </div>
      </section>

      {/* Ultra Premium Footer */}
      <footer className="py-24 bg-white text-black text-center border-t border-black/5 relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-20">
            <div className="flex items-center gap-4">
              <div className="bg-[#d82298] p-4 rounded-2xl shadow-xl rotate-12">
                <Scissors className="text-white" size={32} />
              </div>
              <h4 className="text-4xl font-black text-[#d82298] italic uppercase tracking-tighter">Professional Hair</h4>
            </div>
            <div className="flex gap-14 text-sm font-black uppercase tracking-[0.3em] text-black/30">
              <a href="#" className="hover:text-[#d82298] transition-colors">Termos</a>
              <a href="#" className="hover:text-[#d82298] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#d82298] transition-colors">Suporte VIP</a>
            </div>
          </div>
          <p className="text-[10px] text-black/20 font-black uppercase tracking-[0.8em] border-t border-black/5 pt-20">&copy; 2026 PROFESSIONAL HAIR COURSE - TODOS OS DIREITOS RESERVADOS</p>
        </div>
      </footer>
    </div>
  );
}
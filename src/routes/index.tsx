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
    <div className="bg-[#fafafa] text-gray-900 font-sans relative overflow-hidden">

      {/* Floating Animated Scissors - Fixed Position Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: [0, 360], 
            x: ["-10vw", "110vw"],
            y: ["10vh", "40vh", "10vh"] 
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute opacity-5 text-[#d82298]"
        >
          <Scissors size={120} />
        </motion.div>
        <motion.div
          animate={{ 
            rotate: [-360, 0], 
            x: ["110vw", "-10vw"],
            y: ["80vh", "50vh", "80vh"] 
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute opacity-5 text-[#d82298]"
        >
          <Scissors size={150} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute top-1/4 left-1/4 text-pink-200"
        >
          <Sparkles size={100} />
        </motion.div>
      </div>

      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#d82298] p-2 rounded-lg">
              <Scissors className="text-white" size={20} />
            </div>
            <span className="font-black text-xl italic uppercase tracking-tighter text-[#d82298]">Professional Hair</span>
          </div>
          <button className="hidden md:block bg-[#d82298] text-white px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-all">
            MATRICULE-SE
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-br from-[#d82298] via-[#e945a9] to-[#b01b7a] z-10">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">O curso de cabeleireira mais completo</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter">
              DOMINE A ARTE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">DAS TESOURAS</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-xl font-light leading-relaxed mx-auto lg:mx-0">
              Aprenda com quem faz na prática. 60 aulas gravadas de cursos físicos reais, sem segredos. 
              <span className="font-bold block mt-4 text-white text-3xl">Certificado MEC incluso.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#d82298] py-6 px-12 rounded-3xl font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-gray-50 transition-all uppercase italic tracking-tighter"
              >
                Garantir Minha Vaga
              </motion.button>
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <div className="text-left">
                  <p className="text-4xl font-black tracking-tighter leading-none">R$ 47</p>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Acesso Vitalício</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-4 justify-center lg:justify-start opacity-70">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-[#d82298]" alt="Student" />
                ))}
              </div>
              <p className="text-sm font-bold tracking-tight">+5.200 alunas formadas com sucesso</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden border-[12px] border-white/20 shadow-[0_80px_150px_rgba(0,0,0,0.6)]">
              <img src={images.hero} alt="Curso Profissional" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Aulas Reais.<br/>Resultados Reais.</h4>
              </div>
            </div>
            {/* Decorative colored blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-400 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600 rounded-full blur-[150px] opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-12 bg-white border-b border-gray-50 z-20 relative shadow-sm">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Aulas Full HD", val: "60+" },
            { label: "Alunas Ativas", val: "5.000+" },
            { label: "Certificado MEC", val: "Sim" },
            { label: "Anos de Mercado", val: "12" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-5xl font-black text-[#d82298] tracking-tighter">{stat.val}</p>
              <p className="text-xs uppercase font-black text-gray-400 tracking-[0.2em] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Showcase */}
      <section className="py-32 px-6 container mx-auto bg-[#fafafa] relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter">O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span></h2>
          <p className="text-xl text-gray-500 font-light">Técnicas profissionais de salão explicadas passo a passo em alta definição.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { img: images.lisos, title: "Alisamento Perfeito", desc: "Técnicas de progressiva, selagem e blindagem capilar com brilho espelhado.", tag: "Mais Vendido" },
            { img: images.corte, title: "Corte Geométrico", desc: "Cortes modernos, camadas, chanel e as principais tendências do ano.", tag: "Módulo Expert" },
            { img: images.tonalizacao, title: "Colorimetria & Tonalização", desc: "Aprenda a criar a cor perfeita sem manchar ou danificar os fios.", tag: "Exclusivo" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 group flex flex-col h-full"
            >
              <div className="h-96 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute top-8 left-8 bg-[#d82298] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">{item.tag}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-3 text-[#d82298] font-black uppercase text-xs tracking-widest border-t border-gray-50 pt-6">
                  <CheckCircle size={20} /> <span>100% Prática Profissional</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus / Certificate Section */}
      <section className="py-32 px-6 bg-black text-white relative overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[#d82298] skew-x-[-20deg] translate-x-1/2 opacity-20"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black mb-12 uppercase leading-[0.9] tracking-tighter italic">BÔNUS QUE VALEM <br/> <span className="text-[#d82298]">MAIS QUE O CURSO</span></h2>
              
              <div className="space-y-8">
                {[
                  { icon: Award, title: "Certificado MEC", desc: "Certificação profissional reconhecida que abre portas em grandes salões." },
                  { icon: Users, title: "Comunidade VIP", desc: "Grupo de alunas para networking e troca de experiências reais." },
                  { icon: ShoppingBag, title: "Lista de Fornecedores", desc: "Acesso direto aos fornecedores que os profissionais usam para lucrar mais." },
                  { icon: Gift, title: "Dicas de Vendas", desc: "Como cobrar o preço justo e lotar sua agenda em tempo recorde." }
                ].map((bonus, i) => (
                  <div key={i} className="flex gap-6 items-start bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="bg-[#d82298] p-3 rounded-2xl">
                      <bonus.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-1">{bonus.title}</h4>
                      <p className="opacity-50 text-sm leading-relaxed">{bonus.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(216,34,152,0.4)] border border-white/10">
                <img src={images.certificate} alt="Certificado" className="w-full" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white text-black p-10 rounded-[2.5rem] shadow-2xl hidden md:block">
                <ShieldCheck size={48} className="text-[#d82298] mb-4" />
                <p className="font-black text-2xl tracking-tighter uppercase italic leading-none">VÁLIDO EM<br/>TODO BRASIL</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-32 px-6 bg-white relative z-20 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gray-50 p-12 md:p-20 rounded-[4rem] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d82298]/5 rounded-full -mr-10 -mt-10"></div>
            <Clock size={80} className="mx-auto text-[#d82298] mb-8 opacity-20" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none">RISCO <span className="text-[#d82298]">ZERO</span> PARA VOCÊ</h2>
            <p className="text-xl text-gray-500 mb-12 font-light leading-relaxed">
              Você tem 7 dias de garantia incondicional. Se não gostar do curso ou achar que não é para você, devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
            <ShieldCheck size={120} className="mx-auto text-[#d82298] mb-8" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-[#fafafa] relative z-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-black mb-12 uppercase tracking-tighter leading-[0.8] italic">A HORA DE MUDAR <br/> <span className="text-[#d82298]">DE VIDA É AGORA.</span></h2>
          <p className="text-2xl text-gray-500 mb-16 max-w-2xl mx-auto font-light leading-relaxed">Não perca esta oferta única. O valor de R$ 47 é promocional e pode subir a qualquer momento.</p>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#d82298] text-white py-8 px-16 rounded-[3rem] font-black text-3xl md:text-5xl shadow-[0_30px_70px_rgba(216,34,152,0.5)] uppercase italic tracking-tighter w-full md:w-auto"
          >
            Quero Me Inscrever Agora
          </motion.button>
          
          <div className="mt-16 flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale contrast-125">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Shopping_Cart_Icon.svg" alt="Secure" className="h-8" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white text-center border-t border-gray-100 relative z-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-2">
              <div className="bg-[#d82298] p-2 rounded-lg">
                <Scissors className="text-white" size={24} />
              </div>
              <h4 className="text-3xl font-black text-[#d82298] italic uppercase tracking-tighter">Professional Hair</h4>
            </div>
            <div className="flex gap-10 text-sm font-black uppercase tracking-widest text-gray-400">
              <a href="#" className="hover:text-[#d82298] transition">Termos</a>
              <a href="#" className="hover:text-[#d82298] transition">Privacidade</a>
              <a href="#" className="hover:text-[#d82298] transition">Suporte</a>
            </div>
          </div>
          <p className="text-xs text-gray-300 font-black uppercase tracking-[0.4em] border-t border-gray-50 pt-16">&copy; 2026 Professional Hair Course - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
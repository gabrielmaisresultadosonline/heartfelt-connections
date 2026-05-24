import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, Video, Zap, CheckCircle, Star, Sparkles, Gift, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const images = {
    lisos: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=800",
    corte: "https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=800",
    tonalizacao: "https://images.unsplash.com/photo-1634449595524-da6de2960687?auto=format&fit=crop&q=80&w=800",
    hero: "https://images.unsplash.com/photo-1560869713-7d0a29430039?auto=format&fit=crop&q=80&w=1200"
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 overflow-x-hidden font-sans">
      {/* Floating Elements */}
      <motion.div
        animate={{ rotate: 360, x: ["-10vw", "110vw"], y: ["20vh", "80vh", "20vh"] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="fixed top-0 left-0 opacity-10 z-[100] pointer-events-none text-[#d82298]"
      >
        <Scissors size={40} />
      </motion.div>
      <motion.div
        animate={{ rotate: -360, x: ["110vw", "-10vw"], y: ["70vh", "10vh", "70vh"] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="fixed top-0 left-0 opacity-10 z-[100] pointer-events-none text-[#d82298]"
      >
        <Sparkles size={35} />
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-32 pb-12 px-6 overflow-hidden bg-gradient-to-br from-[#d82298] via-[#e945a9] to-[#b01b7a] z-50">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-bold uppercase tracking-wider">O curso nº 1 do Brasil</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
              DOMINE A ARTE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">DOS CABELOS</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-xl font-light leading-relaxed">
              Aprenda Alisamento, Corte e Tonalização com o método que já transformou mais de 5.000 vidas. 
              <span className="font-bold block mt-2 text-white">60 aulas gravadas em Full HD com IA avançada.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#d82298] py-5 px-10 rounded-2xl font-black text-xl shadow-2xl hover:bg-gray-100 transition-all uppercase"
              >
                Garantir Minha Vaga
              </motion.button>
              <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10">
                <p className="text-2xl font-black tracking-tighter">R$ 47,00</p>
                <div className="h-8 w-[1px] bg-white/30"></div>
                <p className="text-[10px] uppercase font-bold leading-tight opacity-70">Acesso<br/>Vitalício</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
              <img src={images.hero} alt="Profissional" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm font-medium italic">"Técnicas realistas geradas por IA para o seu sucesso."</p>
              </div>
            </div>
            {/* Decorative colored blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400 rounded-full blur-[80px] opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500 rounded-full blur-[100px] opacity-40"></div>
          </motion.div>
        </div>
      </section>

      {/* Showcase Grid */}
      <section className="py-24 px-6 container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 uppercase">Técnicas de Alto Padrão</h2>
          <p className="text-lg text-gray-500">Veja a qualidade do que você vai aprender. Resultados reais e técnicas de vanguarda.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { img: images.lisos, title: "Alisamento Espelhado", tag: "Técnica IA" },
            { img: images.corte, title: "Corte Geométrico", tag: "Moderno" },
            { img: images.tonalizacao, title: "Tonalização Expert", tag: "Colorimetria" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group"
            >
              <div className="h-80 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute top-6 left-6 bg-[#d82298] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">{item.tag}</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2 tracking-tight">{item.title}</h3>
                <div className="flex items-center gap-2 text-[#d82298] font-bold">
                  <CheckCircle size={18} /> <span>Domínio Completo</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#d82298] skew-x-[-15deg] translate-x-1/4 opacity-10"></div>
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-20 text-center uppercase tracking-tighter">Bônus <span className="text-[#d82298]">Exclusivos</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Award, title: "Certificado MEC", desc: "Certificação profissional válida em todo o território nacional." },
              { icon: ShoppingBag, title: "Lista de Fornecedores", desc: "Os melhores produtos com os menores preços do mercado." },
              { icon: Users, title: "Grupo Vip de Alunas", desc: "Networking e suporte direto para tirar todas as suas dúvidas." },
              { icon: Gift, title: "Dicas de Vendas", desc: "Estratégias para lotar sua agenda e fidelizar clientes." },
              { icon: Video, title: "Material de Apoio", desc: "Apostilas digitais para você consultar sempre que precisar." },
              { icon: Zap, title: "Suporte Vitalício", desc: "Nunca fique na mão. Estamos com você em cada etapa." }
            ].map((bonus, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 hover:border-[#d82298]/50 transition-colors"
              >
                <div className="bg-[#d82298] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(216,34,152,0.3)]">
                  <bonus.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{bonus.title}</h3>
                <p className="text-gray-400 leading-relaxed">{bonus.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-white relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d82298] rounded-full blur-[150px] opacity-10 -z-10"
        ></motion.div>
        
        <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-none">A HORA DE MUDAR <br/> <span className="text-[#d82298]">É AGORA.</span></h2>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">Últimas vagas com 90% de desconto. Não deixe o seu futuro para depois.</p>
        
        <motion.button 
          whileHover={{ scale: 1.1, rotate: -2 }}
          whileTap={{ scale: 0.9 }}
          className="bg-[#d82298] text-white py-8 px-16 rounded-[2.5rem] font-black text-3xl shadow-[0_30px_60px_rgba(216,34,152,0.4)] uppercase italic tracking-tighter"
        >
          Quero Acesso Vitalício por R$ 47
        </motion.button>
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 text-center border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <h4 className="text-2xl font-black text-[#d82298] italic uppercase tracking-tighter">Professional Hair</h4>
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
              <a href="#" className="hover:text-[#d82298] transition">Termos</a>
              <a href="#" className="hover:text-[#d82298] transition">Privacidade</a>
              <a href="#" className="hover:text-[#d82298] transition">Suporte</a>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em]">&copy; 2026 Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
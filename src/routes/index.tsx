import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Sparkles, Gift } from "lucide-react";

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
    <div className="bg-[#fafafa] text-[#1a1a1a] font-sans relative overflow-x-hidden min-h-screen">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, x: ["-10vw", "110vw"], y: ["10vh", "40vh", "10vh"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute opacity-10 text-[#d82298]"
        >
          <Scissors size={80} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360, x: ["110vw", "-10vw"], y: ["60vh", "10vh", "60vh"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute opacity-10 text-pink-400"
        >
          <Scissors size={120} />
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 bg-[#d82298] overflow-hidden min-h-[90vh] flex items-center z-10 text-white text-center lg:text-left">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Formação Profissional de Elite</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white">
              DOMINE A ARTE <br/>
              <span className="text-white/80 uppercase italic">DAS TESOURAS</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-xl font-light mx-auto lg:mx-0">
              60 aulas reais gravadas de cursos físicos presenciais. Domine Alisamento, Corte e Tonalização.
              <span className="font-black block mt-4 text-white text-3xl">Certificado MEC Incluso.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#d82298] py-6 px-12 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-gray-50 transition-all uppercase italic tracking-tighter"
              >
                Garantir Minha Vaga
              </motion.button>
              <div className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <p className="text-4xl font-black tracking-tighter leading-none text-white">R$ 47</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>

      {/* About Section - Alessandra Linhares */}
      <section className="py-32 px-6 container mx-auto relative z-30 bg-white rounded-[5rem] shadow-2xl -mt-10 mb-20 border border-gray-100 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#fafafa]">
              <img 
                src="https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Alessandra Linhares" 
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#d82298] text-white p-8 rounded-3xl shadow-xl z-20 hidden md:block">
              <p className="text-4xl font-black italic tracking-tighter leading-none">10+ ANOS</p>
              <p className="text-xs uppercase font-bold tracking-widest mt-2">De Experiência Real</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 text-[#d82298] mb-6">
              <Heart className="fill-[#d82298]" size={20} />
              <span className="font-black uppercase tracking-widest text-sm text-[#d82298]">De Mãe para Filha</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter leading-none">
              QUEM É <br/> <span className="text-[#d82298]">ALESSANDRA LINHARES</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
              <p>
                Olá! Sou <strong>Alessandra Linhares</strong>, fundadora do <span className="text-[#d82298] font-bold underline decoration-2 underline-offset-4">Salão de Beleza AL</span>. 
                Minha história com as tesouras começou antes mesmo de eu nascer.
              </p>
              <p>
                Cresci vendo minha mãe transformar vidas através do autocuidado e da beleza. Essa paixão foi passada <strong>de mãe para filha</strong>, 
                e hoje carrego um legado de mais de 10 anos de experiência prática no dia a dia de um salão de sucesso.
              </p>
              <p>
                Neste curso, eu não apenas ensino técnicas; eu entrego a vivência real que aprendi no "chão de fábrica". 
                Quero que você também sinta o orgulho de ser uma profissional de elite, transformando a sua vida e a da sua família.
              </p>
            </div>
            <div className="mt-10 p-6 bg-[#fafafa] rounded-2xl border-l-4 border-[#d82298] italic text-gray-500">
              "A beleza é um legado que se constrói com amor e técnica."
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section className="py-32 px-6 container mx-auto relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-7xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter">O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span></h2>
          <p className="text-xl text-gray-500 font-light tracking-tight">Técnicas profissionais explicadas passo a passo em alta definição.</p>
        </div>

        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { img: images.lisos, title: "Alisamento", tag: "Mais Vendido", desc: "Técnicas profissionais de progressiva e selagem." },
            { img: images.corte, title: "Cortes", tag: "Expert", desc: "Cortes modernos, camadas e tendências atuais." },
            { img: images.tonalizacao, title: "Tonalização", tag: "Exclusivo", desc: "Colorimetria avançada profissional." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -15 }}
              className="bg-[#fafafa] rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col h-full group"
            >
              <div className="h-96 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute top-8 left-8 bg-[#d82298] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">{item.tag}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter text-[#1a1a1a]">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-3 text-[#d82298] font-black uppercase text-xs tracking-widest border-t border-gray-100 pt-8">
                  <CheckCircle size={20} /> <span>Prática Real</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section className="bg-black text-white py-32 px-6 overflow-hidden relative z-20">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-8xl font-black mb-20 uppercase tracking-tighter italic text-white">BÔNUS <span className="text-[#d82298]">EXCLUSIVOS</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-white">
            {[
              { icon: Award, title: "Certificado MEC" },
              { icon: Users, title: "Comunidade VIP" },
              { icon: ShoppingBag, title: "Fornecedores" },
              { icon: Gift, title: "Dicas Vendas" }
            ].map((bonus, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center">
                <div className="bg-[#d82298] p-5 rounded-2xl mb-8">
                  <bonus.icon size={36} className="text-white" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white">{bonus.title}</h4>
              </motion.div>
            ))}
          </div>
          <p className="text-3xl md:text-5xl font-black mt-24 uppercase italic tracking-tighter text-white">Acesso Vitalício por apenas <span className="text-[#d82298]">R$ 47,00</span></p>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="py-40 px-6 text-center bg-[#fafafa] relative z-30">
        <h2 className="text-6xl md:text-[10rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic text-[#1a1a1a]">A HORA É <br/> <span className="text-[#d82298]">AGORA.</span></h2>
        <motion.button 
           whileHover={{ scale: 1.1, rotate: -1 }}
           whileTap={{ scale: 0.95 }}
           className="bg-[#d82298] text-white py-10 px-20 rounded-[3.5rem] font-black text-3xl md:text-5xl shadow-[0_40px_80px_rgba(216,34,152,0.5)] uppercase italic tracking-tighter inline-block"
        >
          QUERO COMEÇAR AGORA!
        </motion.button>
        <p className="mt-20 text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2026 TODOS OS DIREITOS RESERVADOS</p>
      </footer>
    </div>
  );
}
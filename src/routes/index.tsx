import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck } from "lucide-react";
import alessandraImg from "@/assets/alessandra.jpg";
import heroImg from "@/assets/hero-alessandra.jpg";


export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const images = {
    lisos: "https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=800",
    corte: "https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800",
    tonalizacao: "https://images.pexels.com/photos/3738339/pexels-photo-3738339.jpeg?auto=compress&cs=tinysrgb&w=800",
    hero: heroImg,
    alessandra: alessandraImg,
  };

  const checkoutUrl = "https://pay.kiwify.com.br/AFMNBej";

  const trackAddToCart = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart");
    }
  };

  const PulseButton = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackAddToCart}
      animate={{
        boxShadow: [
          "0 0 0 0px rgba(21, 128, 61, 0.4)",
          "0 0 0 20px rgba(21, 128, 61, 0)",
        ],
        backgroundColor: ["#15803d", "#16a34a", "#15803d"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{ 
        scale: 1.05,
        backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
        backgroundSize: "200% 100%",
      }}
      whileTap={{ scale: 0.95 }}
      className={`bg-[#15803d] text-white font-black shadow-2xl uppercase italic tracking-tighter text-center transition-all duration-300 relative overflow-hidden group ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
    </motion.a>
  );


  return (
    <div className="bg-[#fafafa] text-[#1a1a1a] font-sans relative overflow-x-hidden min-h-screen">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, x: ["-10vw", "110vw"], y: ["10vh", "40vh", "10vh"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute opacity-10 text-[#d82298]"
        >
          <Scissors size={100} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360, x: ["110vw", "-10vw"], y: ["70vh", "10vh", "70vh"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute opacity-10 text-pink-400"
        >
          <Scissors size={140} />
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 bg-[#d82298] overflow-hidden min-h-[90vh] flex items-center z-10 text-white text-center lg:text-left shadow-2xl">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <motion.div initial={{ opacity: 1, x: 0 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Formação de Elite</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white uppercase italic">
              Curso de <br/>
              <span className="text-white/80">Cabeleireira Completo</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-xl font-light mx-auto lg:mx-0 leading-relaxed">
              60 aulas reais gravadas de cursos físicos. Aprenda Alisamento, Corte e Tonalização com quem vive o salão.
              <span className="font-black block mt-4 text-white text-3xl">Certificado MEC Incluso.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <PulseButton className="py-6 px-12 rounded-[2.5rem] text-2xl">
                Garantir Minha Vaga
              </PulseButton>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <p className="text-4xl font-black tracking-tighter text-white">R$ 47</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 1, scale: 1 }} className="relative hidden lg:block">
            <img src={images.hero} alt="Curso" className="rounded-[4rem] border-[12px] border-white/20 shadow-2xl w-full aspect-[4/5] object-cover" />
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-pink-400 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Quem Somos - Alessandra Linhares */}
      <section className="py-32 px-6 container mx-auto relative z-30 bg-white rounded-[5rem] shadow-2xl -mt-10 mb-20 border border-gray-100">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <motion.div initial={{ opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} className="relative mx-auto lg:mx-0">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#fafafa] max-w-[500px]">
              <img src={images.alessandra} alt="Alessandra Linhares" className="w-full aspect-square object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#d82298] text-white p-8 rounded-3xl shadow-xl z-20 hidden md:block">
              <p className="text-4xl font-black italic tracking-tighter leading-none">10+ ANOS</p>
              <p className="text-xs uppercase font-bold tracking-widest mt-2">Experiência Real</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[#d82298] mb-6">
              <Heart className="fill-[#d82298]" size={24} />
              <span className="font-black uppercase tracking-widest text-sm">Legado de Família</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter leading-none">
              QUEM É <br/> <span className="text-[#d82298]">ALESSANDRA LINHARES</span>
            </h2>
            <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
              <p>Sou <strong>Alessandra Linhares</strong>, fundadora do <strong>Salão de Beleza AL</strong>. Cresci vendo minha mãe transformar vidas, e esse amor foi passado <strong>de mãe para filha</strong>.</p>
              <p>Com mais de 10 anos de experiência real, trago para você as técnicas práticas que realmente funcionam no dia a dia do salão, para que você mude sua realidade e de sua família.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section className="py-32 px-6 container mx-auto bg-white relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-4xl md:text-7xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter">O QUE VOCÊ VAI <span className="text-[#d82298]">DOMINAR</span></h2>
          <p className="text-xl text-gray-500 font-light">60 aulas gravadas em Full HD com técnicas profissionais.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Sparkles, title: "Alisamento", tag: "Expert", desc: "Progressivas e selagens com brilho real." },
            { icon: Scissors, title: "Corte", tag: "Moderno", desc: "Técnicas de corte e visagismo avançado." },
            { icon: Paintbrush, title: "Colorimetria", tag: "Elite", desc: "Domine as cores sem erros de salão." }
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -15 }} className="bg-[#fafafa] rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 h-full flex flex-col group">
              <div className="h-80 overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-[#d82298]/5 to-transparent">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                  className="text-[#d82298]"
                >
                  <item.icon size={120} strokeWidth={1.5} />
                </motion.div>
                <div className="absolute top-8 left-8 bg-[#d82298] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">{item.tag}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <div className="flex items-center gap-3 text-[#d82298] font-black uppercase text-xs pt-8 border-t border-gray-100">
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
          <h2 className="text-5xl md:text-8xl font-black mb-20 uppercase tracking-tighter italic">BÔNUS <span className="text-[#d82298]">EXCLUSIVOS</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-white">
            {[{ icon: Award, title: "Certificado MEC" }, { icon: Users, title: "Comunidade VIP" }, { icon: ShoppingBag, title: "Fornecedores" }, { icon: Heart, title: "Dicas de Venda" }].map((bonus, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center">
                <div className="bg-[#d82298] p-5 rounded-2xl mb-8">
                  <bonus.icon size={36} className="text-white" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white">{bonus.title}</h4>
              </motion.div>
            ))}
          </div>
          <p className="text-3xl md:text-5xl font-black mt-24 uppercase italic tracking-tighter text-white">Acesso Vitalício: <span className="text-[#d82298]">R$ 47,00</span></p>
        </div>
      </section>

      {/* Certificate Release Info */}
      <section className="py-24 px-6 relative z-20 bg-gradient-to-br from-[#fafafa] via-white to-[#fdf2f8]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-[3.5rem] shadow-2xl border-2 border-[#d82298]/10 p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#d82298]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid md:grid-cols-[auto_1fr] gap-10 items-center text-center md:text-left">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto md:mx-0 bg-gradient-to-br from-[#d82298] to-pink-500 p-8 rounded-[2rem] shadow-xl shadow-[#d82298]/30"
              >
                <FileCheck size={72} className="text-white" strokeWidth={1.8} />
              </motion.div>

              <div>
                <div className="inline-flex items-center gap-2 bg-[#d82298]/10 text-[#d82298] px-4 py-2 rounded-full mb-5 font-black uppercase text-xs tracking-widest">
                  <Calendar size={14} />
                  <span>Certificado Oficial</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 mb-5 leading-[0.95]">
                  Seu certificado liberado em <span className="text-[#d82298]">até 8 dias</span> após finalizar o curso
                </h3>
                <p className="text-lg text-gray-600 font-light leading-relaxed">
                  Assim que você concluir todas as aulas, em até <strong className="text-gray-900">8 dias úteis</strong> seu certificado reconhecido é emitido com seu nome e foto, pronto para baixar e imprimir.
                </p>
                <div className="flex flex-wrap gap-3 mt-7 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                    <CheckCircle size={16} className="text-[#15803d]" /> Reconhecido
                  </span>
                  <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                    <CheckCircle size={16} className="text-[#15803d]" /> Com seu nome e foto
                  </span>
                  <span className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                    <CheckCircle size={16} className="text-[#15803d]" /> Download imediato
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="py-40 px-6 text-center bg-[#fafafa] relative z-30">
        <h2 className="text-6xl md:text-[10rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic text-[#1a1a1a]">MUDE SUA <br/> <span className="text-[#d82298]">VIDA AGORA.</span></h2>
        <PulseButton className="py-10 px-20 rounded-[3.5rem] text-3xl md:text-5xl inline-block shadow-[0_40px_80px_rgba(21,128,61,0.5)]">
          QUERO MINHA VAGA!
        </PulseButton>
        <p className="mt-20 text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2026 TODOS OS DIREITOS RESERVADOS</p>
      </footer>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck, Flower2, ChevronLeft, ChevronRight, X } from "lucide-react";
import alessandraImg from "@/assets/alessandra.jpg";
import heroImg from "@/assets/hero-alessandra.jpg";
import cert1 from "@/assets/cert-1.jpeg";
import cert2 from "@/assets/cert-2.jpeg";
import cert3 from "@/assets/cert-3.jpeg";
import cert4 from "@/assets/cert-4.jpeg";


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

  const certificates = [
    { src: cert1, name: "Lidione Aparecido Rodrigues Gomes" },
    { src: cert2, name: "Sandra Aparecida Antunes de Oliveira" },
    { src: cert3, name: "Alanna Torres de Araújo" },
    { src: cert4, name: "Ingrid Zilli Monge" },
  ];

  const [activeCert, setActiveCert] = useState(0);
  const [openCert, setOpenCert] = useState<number | null>(null);

  const nextCert = () => setActiveCert((p) => (p + 1) % certificates.length);
  const prevCert = () => setActiveCert((p) => (p - 1 + certificates.length) % certificates.length);

  const checkoutUrl = "https://pay.kiwify.com.br/AFMNBej";

  const trackAddToCart = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart");
    }
  };

  const scrollToOferta = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("oferta");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const PulseButton = ({ children, className = "", asCheckout = false }: { children: React.ReactNode; className?: string; asCheckout?: boolean }) => (
    <motion.a
      href={asCheckout ? checkoutUrl : "#oferta"}
      target={asCheckout ? "_blank" : undefined}
      rel={asCheckout ? "noopener noreferrer" : undefined}
      onClick={asCheckout ? trackAddToCart : scrollToOferta}
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
      className={`bg-[#15803d] text-white font-black shadow-2xl uppercase italic tracking-tighter text-center transition-all duration-300 relative overflow-hidden group cursor-pointer ${className}`}
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

      {/* Alunas Certificadas - Carousel */}
      <section className="py-24 px-4 md:px-6 relative z-20 overflow-hidden bg-gradient-to-b from-[#1a1a1a] via-[#2a0a1f] to-[#1a1a1a]">
        {/* floating petals */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none text-[#d82298]/30"
            initial={{ x: `${(i * 37) % 100}%`, y: -50, rotate: 0, opacity: 0 }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              opacity: [0, 0.8, 0.8, 0],
              x: `${((i * 37) % 100) + (i % 2 === 0 ? 10 : -10)}%`,
            }}
            transition={{ duration: 12 + (i % 5), repeat: Infinity, delay: i * 0.8, ease: "linear" }}
            style={{ left: `${(i * 8) % 100}%` }}
          >
            <Flower2 size={28 + (i % 3) * 8} fill="currentColor" />
          </motion.div>
        ))}

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-14">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d82298] to-pink-400 mb-6 shadow-2xl shadow-[#d82298]/50"
            >
              <Flower2 size={40} className="text-white" />
            </motion.div>
            <p className="text-[#d82298] font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-3">Mais uma profissional no mercado</p>
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
              Certificados <span className="text-[#d82298]">Entregues</span>
            </h2>
            <p className="text-gray-400 mt-4 text-sm md:text-base">Toque na flor para abrir o certificado ✨</p>
          </div>

          {/* Carousel stage */}
          <div className="relative h-[480px] md:h-[600px] flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {certificates.map((cert, i) => {
                const offset = i - activeCert;
                const isActive = offset === 0;
                const abs = Math.abs(offset);
                if (abs > 2) return null;
                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.6, rotateY: 60 }}
                    animate={{
                      opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : 0.2,
                      scale: abs === 0 ? 1 : abs === 1 ? 0.78 : 0.6,
                      x: offset * (typeof window !== "undefined" && window.innerWidth < 768 ? 120 : 280),
                      rotateY: offset * -18,
                      zIndex: 10 - abs,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 110, damping: 18 }}
                    className="absolute w-[280px] md:w-[460px] cursor-pointer"
                    onClick={() => isActive ? setOpenCert(i) : setActiveCert(i)}
                  >
                    <motion.div
                      whileHover={isActive ? { scale: 1.03, y: -8 } : {}}
                      className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(216,34,152,0.4)] border-4 border-white/10"
                    >
                      <img src={cert.src} alt={`Certificado ${cert.name}`} className="w-full h-auto block" loading="lazy" />
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap"
                        >
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                            <Flower2 size={18} className="text-[#d82298]" fill="currentColor" />
                          </motion.div>
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-900">Abrir certificado</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              onClick={prevCert}
              aria-label="Anterior"
              className="absolute left-2 md:left-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-[#d82298] backdrop-blur border border-white/20 text-white flex items-center justify-center transition-all"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              onClick={nextCert}
              aria-label="Próximo"
              className="absolute right-2 md:right-8 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-[#d82298] backdrop-blur border border-white/20 text-white flex items-center justify-center transition-all"
            >
              <ChevronRight size={26} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {certificates.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCert(i)}
                aria-label={`Ir para ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === activeCert ? "w-10 bg-[#d82298]" : "w-2.5 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>

          <div className="flex justify-center mt-6 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
            ))}
          </div>
          <p className="text-center text-white font-black uppercase tracking-[0.3em] text-xs mt-3">CONCLUÍDO</p>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {openCert !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenCert(null)}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            >
              <motion.button
                onClick={() => setOpenCert(null)}
                whileHover={{ rotate: 90, scale: 1.1 }}
                className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center"
                aria-label="Fechar"
              >
                <X size={22} />
              </motion.button>
              <motion.div
                initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotateY: -90, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-3xl w-full"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-8 -left-8 text-[#d82298]"
                >
                  <Flower2 size={56} fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-8 -right-8 text-pink-400"
                >
                  <Flower2 size={48} fill="currentColor" />
                </motion.div>
                <img
                  src={certificates[openCert].src}
                  alt={`Certificado ${certificates[openCert].name}`}
                  className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white/20"
                />
                <p className="text-center text-white font-black uppercase tracking-wider mt-5 text-sm md:text-base">
                  {certificates[openCert].name}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
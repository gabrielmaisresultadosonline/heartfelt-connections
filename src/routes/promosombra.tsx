import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck, Flower2, ChevronLeft, ChevronRight, X, Loader2, LogIn, Gift, FileText, BookOpen, PlayCircle, ClipboardList, ArrowRight } from "lucide-react";
import alessandraImg from "@/assets/alessandra.webp";
const heroImg = { url: "/curso-sobrancelha.png" };
import heroAlessandra from "@/assets/hero-alessandra.webp";
import cert1 from "@/assets/cert-1.webp";
import cert2 from "@/assets/cert-2.webp";
import cert3 from "@/assets/cert-3.webp";
import cert4 from "@/assets/cert-4.webp";
import { createStudentCheckout } from "@/lib/checkout.functions";

const cursoLisoImg = "/curso-liso-perfeito.webp";
const comboImg = "/combo-3-cursos.webp";

export const Route = createFileRoute("/promosombra")({
  component: Promosombra,
});
function Promosombra() {
  const images = {
    lisos: "https://images.pexels.com/photos/973401/pexels-photo-973401.jpeg?auto=compress&cs=tinysrgb&w=800",
    corte: "https://images.pexels.com/photos/3319333/pexels-photo-3319333.jpeg?auto=compress&cs=tinysrgb&w=800",
    tonalizacao: "https://images.pexels.com/photos/3738339/pexels-photo-3738339.jpeg?auto=compress&cs=tinysrgb&w=800",
    hero: heroAlessandra,
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
  const [autoPlay, setAutoPlay] = useState(true);
  const nextCert = () => setActiveCert((p) => (p + 1) % certificates.length);
  const prevCert = () => setActiveCert((p) => (p - 1 + certificates.length) % certificates.length);
  useEffect(() => {
    if (!autoPlay || openCert !== null) return;
    const id = setInterval(() => {
      setActiveCert((p) => (p + 1) % certificates.length);
    }, 2000);
    return () => clearInterval(id);
  }, [autoPlay, openCert, certificates.length]);
  const [showCheckout, setShowCheckout] = useState(false);
  const openCheckout = () => {
    setShowCheckout(true);
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }
  };
  const scrollToOferta = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("oferta");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const PulseButton = ({ children, className = "", asCheckout = false, variant }: { children: React.ReactNode; className?: string; asCheckout?: boolean; variant?: "pink" | "black" | "green" | "yellow" }) => {
    const palette = variant ?? (asCheckout ? "green" : "pink");
    const colors = {
      green: { bg: "#15803d", bgMid: "#16a34a", ring: "rgba(21,128,61,0.4)" },
      pink: { bg: "#d82298", bgMid: "#ff3ea5", ring: "rgba(216,34,152,0.4)" },
      black: { bg: "#0a0a0a", bgMid: "#1a1a1a", ring: "rgba(0,0,0,0.45)" },
      yellow: { bg: "#b8860b", bgMid: "#d4a017", ring: "rgba(184,134,11,0.4)" },
    }[palette];
    return (
      <motion.button
        type="button"
        onClick={asCheckout ? openCheckout : scrollToOferta}
        animate={{
          boxShadow: [
            `0 0 0 0px ${colors.ring}`,
            `0 0 0 20px ${colors.ring.replace(/[\d.]+\)$/, "0)")}`,
          ],
          backgroundColor: [colors.bg, colors.bgMid, colors.bg],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ backgroundColor: colors.bg }}
        className={`text-white font-black shadow-2xl uppercase italic tracking-tighter text-center transition-all duration-300 relative overflow-hidden group cursor-pointer ${className}`}
      >
        <span className="relative z-10">{children}</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </motion.button>
    );
  };
  return (
    <div className="bg-[#fafafa] text-[#1a1a1a] font-sans relative overflow-x-hidden min-h-screen">
      {/* Login Button - Top Right */}
      <Link
        to="/login"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#1a1a1a] font-bold text-sm px-5 py-2.5 rounded-full shadow-xl border border-white/60 hover:bg-white hover:scale-105 transition-all duration-200"
      >
        <LogIn size={16} />
        <span>Entrar</span>
      </Link>
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
              <span className="text-white/80">Sobrancelha</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-xl font-light mx-auto lg:mx-0 leading-relaxed">
              Produtos e processo completo do melhor do liso. Aulas em HD gravadas, direto ao ponto.
              <span className="font-black block mt-4 text-white text-3xl">Certificado MEC Incluso.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <PulseButton variant="yellow" asCheckout className="py-6 px-12 rounded-[2.5rem] text-2xl">
                Garantir Minha Vaga
              </PulseButton>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <p className="text-sm line-through text-white/60 font-bold">De R$ 197</p>
                <p className="text-4xl font-black tracking-tighter text-yellow-300">R$ 29</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 1, scale: 1 }} className="relative hidden lg:block">
            <img loading="eager" fetchPriority="high" decoding="async" src={images.hero} alt="Curso" className="rounded-[4rem] border-[12px] border-white/20 shadow-2xl w-full aspect-[4/5] object-cover" />
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-pink-400 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
          </motion.div>
        </div>
      </section>


      {/* Quem Somos - Alessandra Linhares */}
      <section className="py-32 px-6 container mx-auto relative z-30 bg-white rounded-[5rem] shadow-2xl -mt-10 mb-20 border border-gray-100">
        <div className="grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <motion.div initial={{ opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} className="relative mx-auto lg:mx-0">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#fafafa] max-w-[500px]">
              <img loading="lazy" decoding="async" src={images.alessandra} alt="Alessandra Linhares" className="w-full aspect-square object-cover" />
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
        <div className="text-center mt-16">
          <PulseButton asCheckout className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
            QUERO APRENDER COM A ALESSANDRA →
          </PulseButton>
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
            { icon: Sparkles, title: "Alisamento Perfeito", tag: "Curso", desc: "Progressivas e selagens com brilho real, do zero ao avançado." },
            { icon: Flower2, title: "Sobrancelha", tag: "Curso", desc: "Design, henna e modelagem para valorizar cada rosto." },
            { icon: Star, title: "Extensão de Cílios", tag: "Curso", desc: "Fio a fio, volume russo e brasileiro com técnica profissional." }
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
        <div className="text-center mt-10">
          <PulseButton asCheckout className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
            COMEÇAR MEU CURSO AGORA →
          </PulseButton>
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
          <p className="text-3xl md:text-5xl font-black mt-24 uppercase italic tracking-tighter text-white">Acesso Vitalício: <span className="line-through text-white/40 text-2xl md:text-3xl">De R$ 197</span> <span className="text-[#d82298]">R$ 29,00</span></p>
          <div className="mt-10">
            <PulseButton asCheckout className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
              GARANTIR MEUS BÔNUS →
            </PulseButton>
          </div>
        </div>
      </section>
      {/* Certificate Release Info */}
      <section className="py-24 px-6 relative z-20 bg-gradient-to-br from-[#fafafa] via-white to-[#fdf2f8]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
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
            {/* Certificate Carousel inside the container */}
            <div className="relative mt-12 pt-10 border-t border-[#d82298]/10">
              {/* floating petals */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-[#d82298]/20"
                    initial={{ y: -30, rotate: 0, opacity: 0 }}
                    animate={{
                      y: ["0%", "120%"],
                      rotate: [0, 360],
                      opacity: [0, 0.7, 0.7, 0],
                    }}
                    transition={{ duration: 10 + (i % 4), repeat: Infinity, delay: i * 1.2, ease: "linear" }}
                    style={{ left: `${15 + i * 14}%` }}
                  >
                    <Flower2 size={22 + (i % 3) * 6} fill="currentColor" />
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-[#d82298] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-2">Veja como ele é</p>
              <p className="text-center text-gray-500 text-xs md:text-sm mb-8">Toque na flor para abrir o certificado ✨</p>
              {/* Carousel stage */}
              <div
                className="relative h-[360px] md:h-[520px] flex items-center justify-center select-none"
                style={{ perspective: "1200px" }}
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
                onTouchStart={() => setAutoPlay(false)}
              >
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
                          opacity: abs === 0 ? 1 : abs === 1 ? 0.5 : 0.18,
                          scale: abs === 0 ? 1 : abs === 1 ? 0.78 : 0.6,
                          x: offset * (typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 240),
                          rotateY: offset * -18,
                          zIndex: 10 - abs,
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 110, damping: 18 }}
                        className="absolute w-[220px] md:w-[400px] cursor-grab active:cursor-grabbing"
                        drag={isActive ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.35}
                        onDragStart={() => setAutoPlay(false)}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -60 || info.velocity.x < -300) nextCert();
                          else if (info.offset.x > 60 || info.velocity.x > 300) prevCert();
                        }}
                        onClick={(e) => {
                          if (!isActive) {
                            setActiveCert(i);
                            return;
                          }
                          // Only open if it's a genuine click (not a drag)
                          setOpenCert(i);
                        }}
                      >
                        <motion.div
                          whileHover={isActive ? { scale: 1.03, y: -6 } : {}}
                          className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(216,34,152,0.3)] border-4 border-white"
                        >
                          <img src={cert.src} alt={`Certificado ${cert.name}`} className="w-full h-auto block" loading="lazy" />
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap"
                            >
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                                <Flower2 size={16} className="text-[#d82298]" fill="currentColor" />
                              </motion.div>
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-900">Abrir</span>
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
                  className="absolute left-0 md:left-2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-[#d82298] hover:text-white shadow-lg border border-gray-200 text-gray-700 flex items-center justify-center transition-all"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={nextCert}
                  aria-label="Próximo"
                  className="absolute right-0 md:right-2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-[#d82298] hover:text-white shadow-lg border border-gray-200 text-gray-700 flex items-center justify-center transition-all"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {certificates.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCert(i)}
                    aria-label={`Ir para ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === activeCert ? "w-8 bg-[#d82298]" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
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
      {/* Área de Membros + Bônus */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-black via-[#1a0a14] to-[#2a0a1f] relative z-20 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mt-14">
            <PulseButton className="inline-block px-10 py-5 rounded-full text-white text-lg md:text-xl font-black shadow-2xl">
              QUERO TUDO ISSO AGORA →
            </PulseButton>
          </div>
        </div>
      </section>
      {/* Bônus Exclusivos */}
      <section className="relative z-20 py-20 px-6 bg-gradient-to-br from-[#1a0a14] via-[#2a0f1f] to-[#1a0a14] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Gift className="absolute top-10 right-10 text-yellow-300" size={200} />
          <Sparkles className="absolute bottom-10 left-10 text-[#d82298]" size={180} />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <span className="inline-block bg-yellow-300 text-[#1a1a1a] text-xs md:text-sm font-black uppercase tracking-widest px-6 py-2 rounded-full mb-6 shadow-xl">
            🎁 Bônus Exclusivos Inclusos
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95] mb-4 text-white">
            Ganhe <span className="text-yellow-300">+ R$ 497</span> em Bônus
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
            PDFs, ebooks e materiais exclusivos liberados junto com o curso — <span className="text-yellow-300 font-bold">totalmente grátis</span>.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {[
              { icon: ClipboardList, title: "Ficha de Anamnese", desc: "Modelo profissional pronto para usar com suas clientes.", tag: "PDF" },
              { icon: ClipboardList, title: "Lista de Materiais", desc: "Tudo que você precisa comprar para começar hoje.", tag: "PDF" },
              { icon: PlayCircle, title: "Remoção de Extensão de Cílios", desc: "Aula passo a passo para remoção segura.", tag: "Vídeo" },
              { icon: BookOpen, title: "Apostila Cílios PRO — O Mapa", desc: "Guia completo do mapeamento de cílios.", tag: "PDF" },
              { icon: FileText, title: "Conectando-se ao Sucesso", desc: "Marketing digital para empreendedoras da beleza.", tag: "PDF" },
              { icon: FileText, title: "Crie seu MEI Gratuitamente", desc: "Passo a passo para formalizar seu negócio.", tag: "Ebook" },
              { icon: FileText, title: "Smart — Transformando Sonhos em Realidade", desc: "Método de metas para alavancar sua carreira.", tag: "Ebook" },
              { icon: FileText, title: "Elevando Experiências", desc: "Como criar um serviço de luxo que fideliza clientes.", tag: "Ebook" },
            ].map((b) => (
              <div
                key={b.title}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-yellow-300/30 rounded-3xl p-6 hover:border-yellow-300 hover:scale-[1.02] transition-all duration-300 shadow-xl"
              >
                <div className="absolute -top-3 -right-3 bg-yellow-300 text-[#1a1a1a] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {b.tag}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center mb-4 shadow-lg">
                  <b.icon className="text-[#1a1a1a]" size={28} />
                </div>
                <h3 className="text-white font-black uppercase text-base md:text-lg tracking-tight mb-2 leading-tight">
                  {b.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-yellow-300 text-sm md:text-base font-bold uppercase tracking-widest">
            ⚡ Todos os bônus liberados no ato da compra
          </p>
        </div>
      </section>
      {/* Combo de Cursos - Oferta Relâmpago */}
      <section id="oferta" className="relative z-30 py-20 px-6 bg-gradient-to-br from-[#d82298] via-[#ff3ea5] to-[#d82298] overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="absolute -top-20 -left-20 text-white"
          >
            <Sparkles size={280} />
          </motion.div>
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center text-white">
          <motion.span
            className="inline-block bg-yellow-300 text-[#1a1a1a] text-xs md:text-sm font-black uppercase tracking-widest px-6 py-2 rounded-full mb-6 shadow-xl"
          >
            🔥 Oferta Combo Relâmpago
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95] mb-6">
            Curso de <span className="text-yellow-300">Sobrancelha</span>
          </h2>
          <div className="max-w-xs sm:max-w-sm mx-auto mb-8">
            <img
              src={heroAlessandra}
              alt="Curso de Sobrancelha com Alessandra Linhares"
              className="w-full h-auto rounded-2xl shadow-2xl border-2 border-yellow-300/40"
              loading="lazy"
            />
          </div>
          <p className="text-lg md:text-xl opacity-95 mb-10 font-light max-w-2xl mx-auto">
            Design, henna e modelagem profissional. Aulas em HD gravadas, com certificado MEC incluso.
          </p>


          <div className="grid md:grid-cols-1 gap-6 max-w-xl mx-auto">
            <div className="bg-white text-[#1a1a1a] rounded-[2.5rem] p-8 shadow-2xl border-4 border-yellow-300 flex flex-col">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">Curso de Sobrancelha</h3>
              <ul className="space-y-2 mb-4 text-left text-sm md:text-base">
                {[
                  "Design, henna e modelagem completa",
                  "Aulas em HD gravadas",
                  "Certificado MEC incluso",
                  "Acesso vitalício ao conteúdo",
                ].map((c) => (
                  <li key={c} className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="text-[#d82298] shrink-0" size={18} />{c}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 line-through font-bold">De R$ 197</p>
              <div className="flex items-start justify-center gap-1 my-3">
                <span className="text-2xl font-black text-[#d82298] mt-2">R$</span>
                <span className="text-7xl font-black text-[#d82298] leading-none tracking-tighter">29</span>
              </div>
              <p className="text-xs uppercase font-black tracking-widest text-gray-600 mb-6">Pagamento único • Acesso vitalício</p>
              <PulseButton
                asCheckout
                variant="green"
                className="w-full py-5 px-6 rounded-2xl text-lg md:text-xl flex items-center justify-center mt-auto text-white"
              >
                QUERO O CURSO — R$ 29
              </PulseButton>
            </div>
          </div>

          {/* Combo Completo com Order Bumps visíveis fora do modal */}
          <div className="mt-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-md border-2 border-yellow-300/60 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl">
            <div className="max-w-xs sm:max-w-sm mx-auto mb-5">
              <img
                src={comboImg}
                alt="Combo 3 Cursos - Alisamento, Sobrancelha e Extensão de Cílios"
                className="w-full h-auto rounded-2xl shadow-2xl border-2 border-yellow-300/40"
                loading="lazy"
              />
            </div>
            <div className="inline-block bg-yellow-300 text-[#1a1a1a] text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              💎 Combo Completo
            </div>
            <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">
              Leve <span className="text-yellow-300">TUDO</span> por R$ 66
            </h3>
            <p className="text-white/90 text-sm md:text-base mb-5">
              Pagamento único, acesso vitalício aos 3 cursos + atualizações para sempre.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left mb-6">
                {[
                  { t: "Curso de Sobrancelha", p: "R$ 29" },
                  { t: "Curso de Alisamento Perfeito", p: "+ R$ 14" },
                  { t: "Curso de Extensão de Cílios", p: "+ R$ 14" },
                  { t: "Atualizações Vitalícias", p: "+ R$ 9" },
                  { t: "Marketing Completo (Seguidores)", p: "+ R$ 97" },
                ].map((b) => (
                <div key={b.t} className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle size={16} className="text-yellow-300 shrink-0" /> {b.t}
                  </span>
                  <span className="text-xs font-black text-yellow-300">{b.p}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/25 rounded-2xl p-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70 font-bold">Combo completo</p>
                <p className="text-3xl md:text-4xl font-black text-yellow-300">R$ 66,00</p>
                <p className="text-[10px] uppercase tracking-widest text-white/70">Pagamento único</p>
              </div>
              <PulseButton
                asCheckout
                variant="green"
                className="py-4 px-8 rounded-full text-base md:text-lg text-white"
              >
                QUERO O COMBO — R$ 66
              </PulseButton>
            </div>
            <p className="text-[11px] text-white/80 mt-3 text-center">
              Os complementos aparecem também no checkout — marque só o que quiser.
            </p>
          </div>

          <p className="text-xs md:text-sm text-white/90 mt-6 font-semibold">
            Pagamento seguro • Acesso imediato • Certificado incluso
          </p>
        </div>
      </section>
      {/* Final CTA */}
      <footer className="py-40 px-6 text-center bg-[#fafafa] relative z-30">
        <h2 className="text-6xl md:text-[10rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic text-[#1a1a1a]">TENDÊNCIAS <br/> <span className="text-[#d82298]">2026/2027</span></h2>
        <PulseButton asCheckout className="py-10 px-20 rounded-[3.5rem] text-3xl md:text-5xl inline-block shadow-[0_40px_80px_rgba(216,34,152,0.5)]">
          QUERO MINHA VAGA!
        </PulseButton>
        <p className="mt-20 text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2026 TODOS OS DIREITOS RESERVADOS</p>
        <p className="mt-4 text-[10px] text-gray-400"><a href="/login" className="hover:text-pink-600 underline">Já sou aluna → entrar</a></p>
      </footer>
      <CheckoutModal open={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}

function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createCheckout = useServerFn(createStudentCheckout);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bumpAlisamento, setBumpAlisamento] = useState(false);
  const [bumpCilios, setBumpCilios] = useState(false);
  const [bumpVitalicio, setBumpVitalicio] = useState(false);
  const [bumpCabelereira, setBumpCabelereira] = useState(false);
  const [bumpSeguidores, setBumpSeguidores] = useState(true);
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const base = 29;
  const extras = (bumpAlisamento ? 14 : 0) + (bumpCilios ? 14 : 0) + (bumpVitalicio ? 9 : 0) + (bumpCabelereira ? 14 : 0) + (bumpSeguidores ? 97 : 0);
  const total = base + extras;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const bumps: ("sobrancelha" | "vitalicio" | "cilios" | "alisamento" | "cabelereira-pro" | "seguidores")[] = [];
      if (bumpAlisamento) bumps.push("alisamento");
      if (bumpCilios) bumps.push("cilios");
      if (bumpVitalicio) bumps.push("vitalicio");
      if (bumpCabelereira) bumps.push("cabelereira-pro");
      if (bumpSeguidores) bumps.push("seguidores");
      const r = await createCheckout({
        data: { name: name.trim(), email: email.trim(), phone: phone.trim(), bumps, main: "sombrancelha", instagram: bumpSeguidores ? instagram : undefined },
      });
      if (!r.ok) {
        setErr(r.error || "Erro ao gerar checkout");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "InitiateCheckout", { value: total, currency: "BRL" });
      }
      window.location.href = r.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md md:max-w-4xl p-4 sm:p-6 md:p-10 relative my-4 sm:my-8 max-h-[95vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar">
              <X size={20} />
            </button>
            <div className="text-center mb-4 sm:mb-5 pr-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#d82298] uppercase italic tracking-tight">
                Garantir minha vaga
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Curso de Sobrancelha</p>
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4 md:col-start-1 md:row-start-2">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nome completo</label>
                <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">E-mail</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp (com DDD)</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 w-full border border-pink-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-pink-400 outline-none" />
              </div>
            </div>

            <div className="space-y-4 md:col-start-2 md:row-start-1">


              <div className="pt-2">
                <p className="text-[11px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#d82298]" /> Sua compra
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#d82298] bg-gradient-to-br from-pink-50 to-fuchsia-50 mb-4">
                  <div className="mt-0.5 w-4 h-4 rounded-sm bg-[#d82298] flex items-center justify-center shrink-0">
                    <CheckCircle size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-gray-900 uppercase">Curso de Sobrancelha</p>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#d82298] text-white px-2 py-0.5 rounded-full">Principal</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Acesso vitalício + certificado MEC · <strong className="text-[#d82298]">R$ 29</strong></p>
                  </div>
                </div>
              </div>

              <div className="pt-2 -mx-1 px-3 py-3 rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-dashed border-amber-400 relative">
                <span className="absolute -top-3 left-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  🚀 ECONOMIZE E COMPRE JUNTO!
                </span>
                <p className="text-sm sm:text-base font-black text-amber-900 uppercase tracking-tight mt-1 mb-1">
                  Turbine sua formação
                </p>
                <p className="text-[11px] text-amber-800/80 mb-3 italic font-bold underline">Aproveite nossos descontos exclusivos!</p>
                <div className={`mb-3 p-3 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br from-[#d82298] to-pink-500 border-yellow-400 shadow-lg scale-[1.02]`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={bumpSeguidores} onChange={(e) => setBumpSeguidores(e.target.checked)}
                      className="mt-1 accent-white w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black uppercase italic leading-tight text-white`}>🔥 MARKETING COMPLETO INSTAGRAM</p>
                      <p className={`text-lg font-black mt-1 text-yellow-300`}>(+ R$ 97)</p>
                      <p className={`text-[10px] mt-1 font-bold text-white/90`}>2000 seguidores + 5 mil alcance + curtidas/comentários</p>
                    </div>
                  </label>
                  {bumpSeguidores && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 overflow-hidden">
                      <input required value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Seu @ ou link do Instagram"
                        className="w-full border border-indigo-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-400 outline-none bg-white" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-amber-200/50">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition relative ${bumpAlisamento ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                      <motion.div 
                        animate={{ x: [0, 5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 text-[#d82298] hidden sm:block"
                      >
                        <ArrowRight size={20} className="fill-[#d82298]" />
                      </motion.div>
                      <input
                        type="checkbox"
                        checked={bumpAlisamento}
                        onChange={(e) => setBumpAlisamento(e.target.checked)}
                        className="mt-1 accent-[#d82298] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">Curso de Alisamento Perfeito</p>
                        <p className="text-xs text-gray-600">Adicione o curso completo de alisamento por apenas <br/><strong className="text-[#d82298]">+R$ 14</strong></p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition mt-2 ${bumpCilios ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                      <input
                        type="checkbox"
                        checked={bumpCilios}
                        onChange={(e) => setBumpCilios(e.target.checked)}
                        className="mt-1 accent-[#d82298] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">Curso de Extensão de Cílios</p>
                        <p className="text-xs text-gray-600">Adicione o curso completo de extensão de cílios por apenas <br/><strong className="text-[#d82298]">+R$ 14</strong></p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition mt-2 ${bumpVitalicio ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                      <input
                        type="checkbox"
                        checked={bumpVitalicio}
                        onChange={(e) => setBumpVitalicio(e.target.checked)}
                        className="mt-1 accent-[#d82298] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">Atualizações Vitalícias</p>
                        <p className="text-xs text-gray-600">Todas as novas aulas e atualizações para sempre por <br/><strong className="text-[#d82298]">+R$ 9</strong></p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition mt-2 ${bumpCabelereira ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                      <input
                        type="checkbox"
                        checked={bumpCabelereira}
                        onChange={(e) => setBumpCabelereira(e.target.checked)}
                        className="mt-1 accent-[#d82298] w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">Cabelereira PRO 2027</p>
                        <p className="text-xs text-gray-600">Adicione a formação PRO 2027 por apenas <br/><strong className="text-[#d82298]">+R$ 14</strong></p>
                      </div>
                    </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-fuchsia-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-[#d82298]">R$ {total},00</span>
              </div>

              {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#d82298] hover:bg-[#b8127f] disabled:opacity-70 text-white font-black uppercase tracking-wider py-4 rounded-full shadow-lg transition text-lg">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Gerando pagamento...</> : `Pagar R$ ${total},00 →`}
              </button>
            </div>
              <p className="text-center text-[11px] text-gray-500 mt-1">
                Pagamento processado pela InfinitePay via API MRO - Mais Resultados Online - Gabriel fernandes da silva. Seu acesso é enviado por e-mail assim que confirmado.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

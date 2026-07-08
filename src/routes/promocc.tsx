import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck, Flower2, ChevronLeft, ChevronRight, X } from "lucide-react";
import alessandraImg from "@/assets/alessandra.webp";
import heroImg from "@/assets/hero-alessandra.webp";
import cert1 from "@/assets/cert-1.webp";
import cert2 from "@/assets/cert-2.webp";
import cert3 from "@/assets/cert-3.webp";
import cert4 from "@/assets/cert-4.webp";
import comboAsset from "@/assets/combo-cursos.webp";
import cabeleireiraAsset from "@/assets/curso-cabeleireira.webp";
export const Route = createFileRoute("/promocc")({
  component: Promocc,
});
function Promocc() {
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
  const checkoutUrl = "https://pay.kiwify.com.br/Zdfysv7";
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
  const PulseButton = ({ children, className = "", asCheckout = false, variant }: { children: React.ReactNode; className?: string; asCheckout?: boolean; variant?: "pink" | "black" | "green" | "yellow" }) => {
    const palette = variant ?? (asCheckout ? "green" : "pink");
    const colors = {
      green: { bg: "#15803d", bgMid: "#16a34a", ring: "rgba(21,128,61,0.4)" },
      pink: { bg: "#d82298", bgMid: "#ff3ea5", ring: "rgba(216,34,152,0.4)" },
      black: { bg: "#0a0a0a", bgMid: "#1a1a1a", ring: "rgba(0,0,0,0.45)" },
      yellow: { bg: "#b8860b", bgMid: "#d4a017", ring: "rgba(184,134,11,0.4)" },
    }[palette];
    return (
      <motion.a
        href={asCheckout ? checkoutUrl : "#oferta"}
        target={asCheckout ? "_blank" : undefined}
        rel={asCheckout ? "noopener noreferrer" : undefined}
        onClick={asCheckout ? trackAddToCart : scrollToOferta}
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
      </motion.a>
    );
  };
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
              <PulseButton variant="yellow" className="py-6 px-12 rounded-[2.5rem] text-2xl">
                Garantir Minha Vaga
              </PulseButton>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <p className="text-sm line-through text-white/60 font-bold">De R$ 197</p>
                <p className="text-4xl font-black tracking-tighter text-yellow-300">R$ 10</p>
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
      {/* Combo de Cursos - Oferta Relâmpago */}
      <section className="relative z-30 py-20 px-6 bg-gradient-to-br from-[#d82298] via-[#ff3ea5] to-[#d82298] overflow-hidden">
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
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block bg-yellow-300 text-[#1a1a1a] text-xs md:text-sm font-black uppercase tracking-widest px-6 py-2 rounded-full mb-6 shadow-xl"
          >
            🔥 Oferta Combo Relâmpago
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95] mb-6">
            Escolha sua opção: <br />
            <span className="text-yellow-300">Curso individual</span> ou <span className="underline decoration-yellow-300">Combo Completo</span>
          </h2>
          <p className="text-lg md:text-xl opacity-95 mb-10 font-light max-w-2xl mx-auto">
            Leve apenas o Curso de Cabeleireira Completo, ou escolha o Combo com TODOS os cursos por um valor único.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Solo */}
            <div className="bg-white text-[#1a1a1a] rounded-[2.5rem] p-8 shadow-2xl border-4 border-white flex flex-col">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">Curso de Cabeleireira Completo</h3>
              <img loading="lazy" decoding="async" src={cabeleireiraAsset} alt="Curso de Cabeleireira Completo" className="w-full rounded-2xl mb-4 object-contain bg-black" />
              <ul className="space-y-2 mb-4 text-left text-sm md:text-base">
                {[
                  "Aulas práticas passo a passo",
                  "Certificado em até 8 dias",
                  "Acesso vitalício ao conteúdo",
                  "Suporte direto com a Alessandra",
                  "Bônus exclusivos de lançamento",
                ].map((c) => (
                  <li key={c} className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="text-[#d82298] shrink-0" size={18} />{c}
                  </li>
                ))}
              </ul>
              <div className="mb-4 text-left bg-pink-50 border border-pink-200 rounded-2xl p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#d82298] mb-2">Bônus inclusos:</p>
                <ul className="space-y-1 text-xs md:text-sm text-gray-700">
                  {[
                    "Aulas práticas passo a passo",
                    "Certificado em até 8 dias",
                    "Acesso vitalício ao conteúdo",
                    "Suporte direto com a Alessandra",
                    "Bônus exclusivos de lançamento",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <Sparkles className="text-[#d82298] shrink-0" size={12} />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-500 line-through font-bold">De R$ 197</p>
              <div className="flex items-start justify-center gap-1 my-3">
                <span className="text-2xl font-black text-[#d82298] mt-2">R$</span>
                <span className="text-7xl font-black text-[#d82298] leading-none tracking-tighter">10</span>
              </div>
              <p className="text-xs uppercase font-black tracking-widest text-gray-600 mb-6">Pagamento único</p>
              <PulseButton
                asCheckout
                variant="pink"
                className="w-full py-5 px-6 rounded-2xl text-lg md:text-xl flex items-center justify-center mt-auto"
              >
                QUERO O CURSO — R$ 10
              </PulseButton>
            </div>

            {/* Combo */}
            <div className="bg-white text-[#1a1a1a] rounded-[2.5rem] p-8 shadow-2xl border-4 border-yellow-300 flex flex-col relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-[#1a1a1a] text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">Mais Vendido</span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">Combo Completo — Todos os Cursos</h3>
              <img loading="lazy" decoding="async" src={comboAsset} alt="Combo completo de cursos" className="w-full rounded-2xl mb-4 object-contain bg-black" />
              <ul className="space-y-2 mb-4 text-left text-sm md:text-base">
                {["Cabeleireira Completo","Designer de Sobrancelha","Extensão de Cílios","Marketing p/ Primeiros Clientes"].map((c) => (
                  <li key={c} className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="text-[#d82298] shrink-0" size={18} />{c}
                  </li>
                ))}
              </ul>
              <div className="mb-4 text-left bg-green-50 border border-green-200 rounded-2xl p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#15803d] mb-2">Bônus inclusos:</p>
                <ul className="space-y-1 text-xs md:text-sm text-gray-700">
                  {[
                    "Aulas práticas passo a passo",
                    "Certificado em até 8 dias",
                    "Acesso vitalício ao conteúdo",
                    "Suporte direto com a Alessandra",
                    "Bônus exclusivos de lançamento",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <Sparkles className="text-[#15803d] shrink-0" size={12} />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4 text-left bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-700 mb-3">Comprando tudo junto:</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {[
                    { name: "Cabeleireira Completa — PROMO", price: "R$ 10,00" },
                    { name: "Atualizações vitalícias", price: "R$ 8,00" },
                    { name: "Seus primeiros Clientes", price: "R$ 19,00" },
                    { name: "Extensão de Cílios", price: "R$ 13,00" },
                    { name: "Designer de Sobrancelhas", price: "R$ 13,00" },
                  ].map((i) => (
                    <li key={i.name} className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{i.name}</span>
                      <span className="font-black text-[#15803d]">{i.price}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-gray-300">
                    <span className="font-black uppercase tracking-wide">Total</span>
                    <span className="font-black text-[#15803d] text-lg">R$ 63,00</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-start justify-center gap-1 my-2">
                <span className="text-2xl font-black text-[#15803d] mt-2">R$</span>
                <span className="text-7xl font-black text-[#15803d] leading-none tracking-tighter">63</span>
              </div>
              <p className="text-xs uppercase font-black tracking-widest text-gray-600 mb-6">Pagamento único • Atualizações vitalícias</p>
              <PulseButton
                asCheckout
                variant="green"
                className="w-full py-5 px-6 rounded-2xl text-lg md:text-xl flex items-center justify-center mt-auto"
              >
                LEVAR TODOS — R$ 63
              </PulseButton>
            </div>
          </div>
          <p className="text-xs md:text-sm text-white/90 mt-6 font-semibold">
            Pagamento seguro • Acesso imediato • Certificado incluso
          </p>
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
          <PulseButton className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
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
        <div className="text-center mt-20">
          <PulseButton className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
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
          <p className="text-3xl md:text-5xl font-black mt-24 uppercase italic tracking-tighter text-white">Acesso Vitalício: <span className="line-through text-white/40 text-2xl md:text-3xl">De R$ 197</span> <span className="text-[#d82298]">R$ 10,00</span></p>
          <div className="mt-10">
            <PulseButton className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
              GARANTIR MEUS BÔNUS →
            </PulseButton>
          </div>
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
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-[#d82298]/20 border border-[#d82298]/40 rounded-full text-[#ff7ac4] text-sm font-bold tracking-widest uppercase mb-6"
            >
              Veja por dentro
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
            >
              A sua <span className="text-[#ff7ac4]">área de membros</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            >
              Mais de <span className="text-[#ff7ac4] font-bold">60 aulas gravadas</span> dos cursos presenciais da Alessandra, organizadas em módulos para você assistir quando e onde quiser.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(216,34,152,0.5)] border-4 border-[#d82298]/40 mb-16 bg-black"
          >
            <video
              ref={(el) => { if (el) { el.muted = true; el.volume = 0; } }}
              src="/videos/area-membros.mp4"
              autoPlay
              loop
              muted
              playsInline
              disableRemotePlayback
              className="w-full h-auto block"
            />
          </motion.div>
          <div className="text-center mt-14">
            <PulseButton className="inline-block px-10 py-5 rounded-full text-white text-lg md:text-xl font-black shadow-2xl">
              QUERO TUDO ISSO AGORA →
            </PulseButton>
          </div>
        </div>
      </section>
      {/* Certificado na hora */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] relative z-20 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d82298]/10 border border-[#d82298]/30 rounded-full text-[#d82298] text-sm font-bold tracking-widest uppercase mb-6"
          >
            <FileCheck className="w-4 h-4" /> Certificado oficial
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-tight"
          >
            Seu certificado <span className="text-[#d82298]">gerado na hora</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-12"
          >
            Assim que você finalizar o curso, é só preencher seus dados e o seu <span className="font-bold text-[#d82298]">certificado de conclusão</span> é emitido na hora, pronto pra imprimir e usar profissionalmente.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden mx-auto max-w-3xl"
            style={{
              border: "6px solid transparent",
              backgroundImage:
                "linear-gradient(#fff, #fff), linear-gradient(135deg, #d82298, #ff7ac4, #d82298)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow: "0 30px 80px -20px rgba(216,34,152,0.45)",
            }}
          >
            <video
              ref={(el) => { if (el) { el.muted = true; el.volume = 0; } }}
              src="/videos/certificado-gerado.mp4"
              autoPlay
              loop
              muted
              playsInline
              disableRemotePlayback
              className="w-full h-auto block"
            />
          </motion.div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-gray-700 font-semibold">
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#d82298]" /> Emissão imediata</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#d82298]" /> Válido em todo Brasil</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#d82298]" /> Reconhecimento profissional</span>
          </div>
          <div className="mt-10">
            <PulseButton className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
              QUERO MEU CERTIFICADO →
            </PulseButton>
          </div>
        </div>
      </section>
      {/* Oferta / Preço */}
      <section id="oferta" className="py-24 md:py-32 px-6 bg-gradient-to-br from-[#fdf2f8] via-white to-[#fce7f3] relative z-30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="absolute -top-20 -left-20 text-[#d82298]/5"
          >
            <Flower2 size={300} />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
            className="absolute -bottom-20 -right-20 text-pink-400/10"
          >
            <Flower2 size={400} />
          </motion.div>
        </div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#d82298] text-white text-xs md:text-sm font-black uppercase tracking-widest px-5 py-2 rounded-full mb-6">
              Oferta Especial de Lançamento
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1a1a1a] leading-none">
              Garanta sua <span className="text-[#d82298]">vaga hoje</span>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-[0_30px_80px_rgba(216,34,152,0.25)] border-2 border-[#d82298]/10 relative"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-[#1a1a1a] text-[10px] md:text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
              Acesso Imediato
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-center text-[#1a1a1a] mb-6">
              Curso Completo de Cabeleireira Profissional
            </h3>
            <ul className="space-y-3 mb-8 max-w-md mx-auto">
              {[
                "Aulas práticas passo a passo",
                "Certificado em até 8 dias",
                "Acesso vitalício ao conteúdo",
                "Suporte direto com a Alessandra",
                "Bônus exclusivos de lançamento",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-[#1a1a1a] font-semibold text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-center mb-8">
              <p className="text-gray-400 line-through text-lg md:text-xl font-bold">De R$ 197,00</p>
              <p className="text-base md:text-lg font-black text-[#1a1a1a] uppercase tracking-wider mt-2">
                Por apenas
              </p>
              <div className="flex items-start justify-center gap-1 mt-1">
                <span className="text-2xl md:text-3xl font-black text-[#d82298] mt-3">R$</span>
                <span className="text-7xl md:text-9xl font-black text-[#d82298] leading-none tracking-tighter">10</span>
                <span className="text-2xl md:text-3xl font-black text-[#d82298] mt-3">,00</span>
              </div>
              <p className="text-sm md:text-base text-gray-700 font-bold mt-2 uppercase tracking-wider">
                Acesso Vitalício
              </p>
            </div>
            <PulseButton
              asCheckout
              className="w-full py-7 md:py-8 px-6 rounded-2xl text-xl md:text-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(21,128,61,0.4)]"
            >
              COMPRAR AGORA
            </PulseButton>
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6 text-xs md:text-sm text-gray-600 font-semibold">
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600" /> Pagamento Seguro</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600" /> Garantia 7 dias</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600" /> Acesso imediato</span>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Final CTA */}
      <footer className="py-40 px-6 text-center bg-[#fafafa] relative z-30">
        <h2 className="text-6xl md:text-[10rem] font-black mb-16 uppercase tracking-tighter leading-[0.8] italic text-[#1a1a1a]">MUDE SUA <br/> <span className="text-[#d82298]">VIDA AGORA.</span></h2>
        <PulseButton className="py-10 px-20 rounded-[3.5rem] text-3xl md:text-5xl inline-block shadow-[0_40px_80px_rgba(216,34,152,0.5)]">
          QUERO MINHA VAGA!
        </PulseButton>
        <p className="mt-20 text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2026 TODOS OS DIREITOS RESERVADOS</p>
      </footer>
    </div>
  );
}
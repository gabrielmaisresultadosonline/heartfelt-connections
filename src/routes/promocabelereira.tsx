import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck, Flower2, ChevronLeft, ChevronRight, X, Loader2, LogIn, Gift, FileText, BookOpen, PlayCircle, ClipboardList, ArrowRight } from "lucide-react";
import alessandraImg from "@/assets/alessandra.webp";
import heroAlessandra from "@/assets/hero-alessandra.webp";
import cabelereiraProAsset from "@/assets/cover-cabelereira-pro-2027.png.asset.json";
const heroCabelereira = cabelereiraProAsset.url;
import cert1 from "@/assets/cert-1.webp";
import cert2 from "@/assets/cert-2.webp";
import cert3 from "@/assets/cert-3.webp";
import cert4 from "@/assets/cert-4.webp";
import { createStudentCheckout } from "@/lib/checkout.functions";

const comboImg = "/combo-3-cursos.webp";

export const Route = createFileRoute("/promocabelereira")({
  component: PromoCabelereira,
});

function PromoCabelereira() {
  const images = {
    hero: heroCabelereira,
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

  const nextCert = () => setActiveCert((p) => (p + 1) % certificates.length);
  const prevCert = () => setActiveCert((p) => (p - 1 + certificates.length) % certificates.length);

  useEffect(() => {
    if (!autoPlay || openCert !== null) return;
    const id = setInterval(() => {
      setActiveCert((p) => (p + 1) % certificates.length);
    }, 2000);
    return () => clearInterval(id);
  }, [autoPlay, openCert, certificates.length]);

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
      <Link to="/login" className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#1a1a1a] font-bold text-sm px-5 py-2.5 rounded-full shadow-xl border border-white/60 hover:bg-white hover:scale-105 transition-all duration-200">
        <LogIn size={16} />
        <span>Entrar</span>
      </Link>

      <section className="relative pt-24 pb-20 px-6 bg-[#d82298] overflow-hidden min-h-[90vh] flex items-center z-10 text-white text-center lg:text-left shadow-2xl">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-20">
          <motion.div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30 mx-auto lg:mx-0">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Formação de Elite 2027</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tighter text-white uppercase italic">
              Cabelereira <br/>
              <span className="text-white/80">PRO 2027</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-xl font-light mx-auto lg:mx-0 leading-relaxed">
              O mesmo conteúdo de elite do alisamento agora com formação PRO 2027. Aulas em HD gravadas, direto ao ponto.
              <span className="font-black block mt-4 text-white text-3xl">Certificado MEC Incluso.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <PulseButton variant="yellow" asCheckout className="py-6 px-12 rounded-[2.5rem] text-2xl">
                Garantir Minha Vaga PRO — R$ 25
              </PulseButton>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <p className="text-sm line-through text-white/60 font-bold">De R$ 197</p>
                <p className="text-4xl font-black tracking-tighter text-yellow-300">R$ 25</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="relative hidden lg:block">
            <img loading="eager" fetchPriority="high" src={images.hero} alt="Curso" className="rounded-[4rem] border-[12px] border-white/20 shadow-2xl w-full aspect-[4/5] object-cover object-[right_center]" />
          </motion.div>
        </div>
      </section>

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
              QUERO APRENDER COM A ALESSANDRA POR R$ 25 →
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
            { icon: Sparkles, title: "Técnicas 2027", tag: "Exclusivo", desc: "Domine as técnicas mais modernas e avançadas de alisamento e tratamentos para 2027." },
            { icon: Scissors, title: "Curso Completo", tag: "Formação", desc: "Aprenda tudo sobre a profissão de cabeleireira, do básico ao nível PRO." },
            { icon: Sparkles, title: "Tendências & Novidades", tag: "Novo", desc: "Fique por dentro das últimas tendências do mercado e novidades internacionais." }
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
            COMEÇAR MEU CURSO AGORA POR R$ 25 →
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
          <p className="text-3xl md:text-5xl font-black mt-24 uppercase italic tracking-tighter text-white">Acesso Vitalício: <span className="line-through text-white/40 text-2xl md:text-3xl">De R$ 197</span> <span className="text-[#d82298]">R$ 25,00</span></p>
          <div className="mt-10">
            <PulseButton asCheckout className="inline-block py-5 px-10 rounded-full text-lg md:text-xl">
              GARANTIR MEUS BÔNUS POR R$ 25 →
            </PulseButton>
          </div>
        </div>
      </section>

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
  const [bumpSobrancelha, setBumpSobrancelha] = useState(false);
  const [bumpVitalicio, setBumpVitalicio] = useState(false);
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

  const base = 25;
  const extras = (bumpAlisamento ? 14 : 0) + (bumpCilios ? 14 : 0) + (bumpSobrancelha ? 14 : 0) + (bumpVitalicio ? 9 : 0) + (bumpSeguidores ? 97 : 0);
  const total = base + extras;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const bumps: ("sobrancelha" | "vitalicio" | "cilios" | "alisamento" | "seguidores")[] = [];
      if (bumpAlisamento) bumps.push("alisamento");
      if (bumpCilios) bumps.push("cilios");
      if (bumpSobrancelha) bumps.push("sobrancelha");
      if (bumpVitalicio) bumps.push("vitalicio");
      if (bumpSeguidores) bumps.push("seguidores");

      const r = await createCheckout({
        data: { name: name.trim(), email: email.trim(), phone: phone.trim(), main: "cabelereira-pro", bumps, instagram: bumpSeguidores ? instagram : undefined },
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
                Garantir minha vaga PRO
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Formação Cabelereira PRO 2027</p>
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
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

            <div className="space-y-4">

              <div className="pt-2">
                <p className="text-[11px] sm:text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  🛒 Sua compra
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#d82298] bg-gradient-to-br from-pink-50 to-fuchsia-50 mb-4">
                  <div className="mt-0.5 w-4 h-4 rounded-sm bg-[#d82298] flex items-center justify-center shrink-0">
                    <CheckCircle size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-gray-900 uppercase">Cabelereira PRO 2027</p>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#d82298] text-white px-2 py-0.5 rounded-full">Principal</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Acesso vitalício + certificado MEC · <strong className="text-[#d82298]">R$ 25</strong></p>
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
                
                {/* Marketing Primeiro */}
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
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition relative ${bumpCilios ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                    <motion.div 
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 text-[#d82298] hidden sm:block"
                    >
                      <ArrowRight size={20} className="fill-[#d82298]" />
                    </motion.div>
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
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${bumpAlisamento ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                    <input
                      type="checkbox"
                      checked={bumpAlisamento}
                      onChange={(e) => setBumpAlisamento(e.target.checked)}
                      className="mt-1 accent-[#d82298] w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">Curso de Alisamento Perfeito</p>
                      <p className="text-xs text-gray-600">Adicione o curso completo de alisamento por apenas <strong className="text-[#d82298]">+R$ 14</strong></p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${bumpSobrancelha ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
                    <input
                      type="checkbox"
                      checked={bumpSobrancelha}
                      onChange={(e) => setBumpSobrancelha(e.target.checked)}
                      className="mt-1 accent-[#d82298] w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">Curso de Sobrancelha</p>
                      <p className="text-xs text-gray-600">Adicione o curso de design de sobrancelha por apenas <br/><strong className="text-[#d82298]">+R$ 14</strong></p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${bumpVitalicio ? "border-[#d82298] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}>
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

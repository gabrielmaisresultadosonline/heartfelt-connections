import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Scissors, Award, Users, ShoppingBag, CheckCircle, Star, Heart, Sparkles, Paintbrush, Calendar, FileCheck, Flower2, ChevronLeft, ChevronRight, X, Loader2, LogIn, Gift, FileText, BookOpen, PlayCircle, ClipboardList } from "lucide-react";
import alessandraImg from "@/assets/alessandra.webp";
import heroImg from "@/assets/hero-alessandra.webp";
import cert1 from "@/assets/cert-1.webp";
import cert2 from "@/assets/cert-2.webp";
import cert3 from "@/assets/cert-3.webp";
import cert4 from "@/assets/cert-4.webp";
import { createStudentCheckout } from "@/lib/checkout.functions";

const cursoLisoImg = "/curso-liso-perfeito.webp";
const comboImg = "/combo-3-cursos.webp";

export const Route = createFileRoute("/promocabelereira")({
  component: PromoCabelereira,
});

function PromoCabelereira() {
  const images = {
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
              <PulseButton variant="yellow" className="py-6 px-12 rounded-[2.5rem] text-2xl">
                Garantir Minha Vaga PRO
              </PulseButton>
              <div className="bg-black/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
                <p className="text-sm line-through text-white/60 font-bold">De R$ 197</p>
                <p className="text-4xl font-black tracking-tighter text-yellow-300">R$ 25</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 text-white">Acesso Vitalício</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="relative hidden lg:block">
            <img loading="eager" fetchPriority="high" src={images.hero} alt="Curso" className="rounded-[4rem] border-[12px] border-white/20 shadow-2xl w-full aspect-[4/5] object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 container mx-auto relative z-30 bg-white rounded-[5rem] shadow-2xl -mt-10 mb-20 border border-gray-100">
         <div className="text-center">
           <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10 text-[#d82298]">Conteúdo do Curso</h2>
           <p className="text-gray-600 text-lg mb-10">O curso Cabelereira PRO 2027 utiliza a metodologia completa do Alisamento Perfeito com novos módulos exclusivos.</p>
           <PulseButton className="py-5 px-10 rounded-full text-lg">QUERO ME INSCREVER AGORA →</PulseButton>
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
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await createCheckout({
        data: { name: name.trim(), email: email.trim(), phone: phone.trim(), main: "cabelereira-pro", bumps: [] },
      });
      if (!r.ok) {
        setErr(r.error || "Erro ao gerar checkout");
        setLoading(false);
        return;
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
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
          >
            <h3 className="text-2xl font-black text-[#d82298] text-center mb-6">Garantir minha vaga PRO</h3>
            <form onSubmit={onSubmit} className="space-y-4">
              <input placeholder="Nome" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl p-3" />
              <input placeholder="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-xl p-3" />
              <input placeholder="WhatsApp" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-xl p-3" />
              <button type="submit" disabled={loading} className="w-full bg-[#d82298] text-white font-black py-4 rounded-full">
                {loading ? "Processando..." : "Pagar R$ 25,00 →"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

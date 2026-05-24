import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scissors, Award, Users, Video, Zap, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#d82298] text-white py-24 px-6 text-center overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Animated Flying Scissors */}
        <motion.div
          animate={{ 
            rotate: [0, 360], 
            x: ["-10vw", "110vw"],
            y: ["10vh", "30vh", "10vh"] 
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute top-0 left-0 opacity-20 z-0 pointer-events-none"
        >
          <Scissors size={80} />
        </motion.div>

        <motion.div
          animate={{ 
            rotate: [360, 0], 
            x: ["110vw", "-10vw"],
            y: ["70vh", "50vh", "70vh"] 
          }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute top-0 left-0 opacity-20 z-0 pointer-events-none"
        >
          <Scissors size={100} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight uppercase italic tracking-tighter">
            Torne-se uma <br/> 
            <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Cabeleireira</span> de Elite
          </h1>
          <p className="text-xl md:text-3xl mb-12 max-w-3xl mx-auto font-light opacity-90">
            Aprenda do zero: Alisamento, Corte e Tonalização com técnicas avançadas e aulas em Full HD.
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white text-[#d82298] p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] inline-block border-4 border-white"
          >
            <p className="text-xl font-bold line-through opacity-50 mb-0">De R$ 497,00</p>
            <p className="text-5xl font-black mb-2 tracking-tighter">Por R$ 47,00</p>
            <p className="text-sm font-black mb-8 uppercase tracking-[0.2em] bg-gray-100 py-1 rounded-full">Acesso Vitalício + Bônus</p>
            <button className="bg-[#d82298] text-white py-5 px-12 rounded-2xl font-black text-2xl hover:bg-black transition-all shadow-[0_10px_20px_rgba(216,34,152,0.4)] uppercase">
              Quero Minha Vaga Agora!
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 px-6 container mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase italic">Tudo que você recebe</h2>
          <div className="w-24 h-2 bg-[#d82298] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Video, title: "60 Aulas HD", desc: "Passo a passo detalhado gravado com qualidade de cinema." },
            { icon: Award, title: "Certificado MEC", desc: "Certificação profissional reconhecida nacionalmente." },
            { icon: Users, title: "Grupo de Elite", desc: "Networking com fornecedores e estratégias de vendas." },
            { icon: Zap, title: "Acesso Vitalício", desc: "Estude no seu ritmo, quando e onde quiser, para sempre." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -15, scale: 1.02 }}
              className="p-10 border border-gray-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all bg-white group"
            >
              <div className="w-20 h-20 bg-[#fdf2f8] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#d82298] group-hover:text-white transition-colors">
                <item.icon size={40} className="text-[#d82298] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Professional Content */}
      <section className="py-32 px-6 bg-black text-white overflow-hidden relative">
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase leading-tight">
                Domine as técnicas que mais dão <span className="text-[#d82298]">lucro</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Alisamento Perfeito", desc: "Técnicas seguras para resultados espelhados." },
                  { icon: Scissors, title: "Cortes Modernos", desc: "Tendências internacionais para todos os tipos de fios." },
                  { title: "Tonalização Expert", desc: "Colorimetria avançada sem segredos." }
                ].map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    key={i} 
                    className="flex gap-6 items-start"
                  >
                    <div className="mt-1 bg-[#d82298] p-2 rounded-lg">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold mb-2 uppercase tracking-tighter">{m.title}</h4>
                      <p className="opacity-60 text-lg">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="aspect-square bg-[#d82298] rounded-[3rem] p-1 shadow-[0_0_100px_rgba(216,34,152,0.3)] flex items-center justify-center text-white"
              >
                <div className="text-center">
                  <Scissors size={120} className="mx-auto mb-6 opacity-20" />
                  <p className="text-4xl font-black uppercase italic">Método<br/>Exclusivo</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-12 uppercase">Comece sua transformação hoje</h2>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-[#d82298] text-white py-8 px-16 rounded-[2rem] font-black text-3xl shadow-[0_30px_60px_rgba(216,34,152,0.4)] uppercase italic tracking-tighter"
        >
          Quero o Acesso Vitalício
        </motion.button>
        <p className="mt-8 text-gray-400 font-bold uppercase tracking-widest">Oferta por tempo limitado</p>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100 text-center">
        <p className="font-bold text-gray-400 uppercase tracking-widest text-sm italic">&copy; 2026 Professional Hair Course - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
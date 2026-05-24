import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. For sites with multiple pages (About, Services, Contact, etc.),
// create separate route files (about.tsx, services.tsx, contact.tsx) — don't put all pages in this file.

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
      <section className="relative bg-[#d82298] text-white py-24 px-6 text-center overflow-hidden">
        <motion.div
          animate={{ rotate: [0, 20, 0], x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 left-10 opacity-30"
        >
          <Scissors size={120} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Curso de Cabeleireira Profissional</h1>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">Domine Alisamento, Corte e Tonalização. 60 aulas em Full HD para você lucrar muito.</p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white text-[#d82298] p-8 rounded-2xl shadow-2xl inline-block border-8 border-[#f4a9d0]"
          >
            <p className="text-3xl font-black mb-2">Apenas R$ 47,00</p>
            <p className="text-lg font-bold mb-6 uppercase tracking-wider">Acesso Vitalício</p>
            <button className="bg-[#d82298] text-white py-4 px-10 rounded-full font-bold text-xl hover:bg-black transition shadow-lg">
              Quero Me Inscrever Agora!
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-20 text-[#d82298]">O que você vai conquistar</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Video, title: "60 Aulas", desc: "Conteúdo completo em Full HD." },
            { icon: Award, title: "Certificado MEC", desc: "Reconhecido em todo Brasil." },
            { icon: Users, title: "Comunidade VIP", desc: "Fornecedores e estratégias." },
            { icon: Zap, title: "Vitalício", desc: "Acesse para sempre." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#d82298] transition-all bg-gray-50 text-center"
            >
              <item.icon className="mx-auto mb-6 text-[#d82298]" size={48} />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 px-6 bg-[#fdf2f8]">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Técnicas que você dominará</h2>
          <ul className="space-y-6">
            {["Alisamentos modernos e saudáveis", "Cortes com geometria precisa", "Tonalização e colorimetria avançada"].map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 text-2xl font-medium bg-white p-6 rounded-2xl shadow-sm"
              >
                <CheckCircle className="text-[#d82298]" /> {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-alessandra.jpg";
import alessandraImg from "@/assets/alessandra.jpg";
import cert1 from "@/assets/cert-1.jpeg";
import cert2 from "@/assets/cert-2.jpeg";
import cert3 from "@/assets/cert-3.jpeg";
import cert4 from "@/assets/cert-4.jpeg";
import comboAsset from "@/assets/combo-cursos.png";
import cabeleireiraAsset from "@/assets/curso-cabeleireira.png";

export const Route = createFileRoute("/vendassc")({
  head: () => ({
    meta: [
      { title: "Curso de Cabeleireira Completo — R$25 | Beleza Liso Perfeito" },
      { name: "description", content: "Torne-se cabeleireira profissional. Curso completo por R$25 ou combo com 4 cursos por R$89. Certificado incluso, acesso vitalício." },
      { property: "og:title", content: "Curso de Cabeleireira Completo — R$25" },
      { property: "og:description", content: "Aulas práticas, certificado em 8 dias, acesso vitalício. Comece agora." },
    ],
  }),
  component: VendasSC,
});

const CHECKOUT = "https://pay.kiwify.com.br/4QUnghd";

function VendasSC() {
  const [timer, setTimer] = useState(9 * 60 + 57);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  const certificates = [
    { src: cert1, name: "Lidione Rodrigues" },
    { src: cert2, name: "Sandra Antunes" },
    { src: cert3, name: "Alanna Torres" },
    { src: cert4, name: "Ingrid Zilli" },
  ];

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % certificates.length), 3000);
    return () => clearInterval(id);
  }, [certificates.length]);

  const track = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart");
    }
  };

  const faqs = [
    { q: "Preciso ter experiência para começar?", a: "Não! O curso vai do básico ao avançado, ideal para iniciantes e para quem já atua e quer profissionalizar." },
    { q: "Como recebo o acesso?", a: "Imediatamente após o pagamento, direto no seu e-mail. Acesso 100% online e vitalício." },
    { q: "Existe certificado?", a: "Sim, certificado válido em todo território nacional, emitido em até 8 dias após conclusão." },
    { q: "Quanto tempo tenho de acesso?", a: "Acesso vitalício — estude no seu ritmo, quantas vezes quiser." },
    { q: "Tenho garantia?", a: "Sim, 7 dias de garantia incondicional. Não gostou, devolvemos 100%." },
    { q: "Qual a diferença entre o curso e o combo?", a: "O curso individual é apenas Cabeleireira Completo (R$25). O combo (R$89) inclui Cabeleireira + Sobrancelha + Cílios + Marketing." },
  ];

  return (
    <div className="min-h-screen bg-[#fdf7fb] text-[#1a1a1a] font-sans">
      {/* Top bar */}
      <div className="h-2 bg-gradient-to-r from-[#d82298] via-[#ff3ea5] to-[#d82298]" />

      {/* Timer */}
      <div className="bg-[#1a1a1a] text-white text-center py-3 px-4 text-sm md:text-base font-bold flex items-center justify-center gap-2 sticky top-0 z-40">
        <span>⏰</span>
        <span>Promoção encerra em:</span>
        <span className="bg-[#d82298] px-3 py-1 rounded-lg font-black tabular-nums">{mm}:{ss}</span>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Headline */}
        <section className="text-center space-y-4">
          <div className="inline-block bg-pink-100 text-[#d82298] text-xs md:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
            💇‍♀️ Oferta Exclusiva
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-tight tracking-tight">
            <span className="text-[#d82298]">Curso de Cabeleireira<br/>Completo</span>
            <br/>Do básico ao avançado por <span className="text-green-600">R$25</span>
          </h1>
          <div className="bg-white rounded-2xl shadow border border-pink-100 p-4 inline-block">
            <p className="text-xs md:text-sm text-gray-600">Você recebe imediatamente por</p>
            <div className="flex items-center justify-center gap-3 mt-1 text-sm md:text-base font-bold">
              <span>📩 E-mail</span><span className="text-pink-300">|</span><span>🎓 Área do aluno</span>
            </div>
          </div>
        </section>

        {/* Hero image */}
        <section>
          <img src={heroImg} alt="Alessandra Linhares" className="w-full rounded-3xl shadow-xl aspect-[4/5] object-cover" />
        </section>

        {/* CTA 1 */}
        <section className="text-center">
          <a href="#precos" onClick={track} className="block w-full bg-gradient-to-b from-green-500 to-green-700 text-white font-black uppercase tracking-wide py-5 px-6 rounded-2xl text-lg md:text-xl shadow-[0_10px_30px_rgba(21,128,61,0.4)] hover:scale-[1.02] transition">
            ✅ QUERO GARANTIR MINHA VAGA AGORA
          </a>
          <p className="text-xs text-gray-500 mt-2">🔒 Compra 100% segura • Acesso imediato</p>
        </section>

        {/* Benefícios */}
        <section className="bg-white rounded-3xl shadow p-6 space-y-4 border border-pink-100">
          <p className="text-base md:text-lg text-center leading-relaxed">
            Aulas prontas, práticas e testadas — para você <strong>trabalhar em casa, em salão ou abrir o seu próprio negócio</strong>.
          </p>
          <ul className="space-y-3">
            {[
              "Do básico ao avançado — mesmo sem experiência",
              "Certificado válido em todo o Brasil",
              "Aulas em vídeo passo a passo",
              "Suporte direto com a Alessandra",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="text-green-600 font-black shrink-0">✓</span>
                <span className="font-semibold text-sm md:text-base">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <a href="#precos" onClick={track} className="block text-center w-full bg-gradient-to-b from-[#d82298] to-[#a4176f] text-white font-black uppercase tracking-wide py-5 px-6 rounded-2xl text-lg shadow-[0_10px_30px_rgba(216,34,152,0.4)] hover:scale-[1.02] transition">
          💇‍♀️ QUERO SER CABELEIREIRA
        </a>

        {/* Módulos */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-center uppercase">
            O que você vai <span className="text-[#d82298]">aprender</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { t: "Corte Feminino", d: "Clássicos e modernos" },
              { t: "Escova & Modelagem", d: "Lisas, onduladas e mais" },
              { t: "Coloração & Mechas", d: "Colorimetria e balayage" },
              { t: "Penteados", d: "Noivas e ocasiões" },
            ].map((m) => (
              <div key={m.t} className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm">
                <h3 className="font-black text-sm md:text-base text-[#d82298]">{m.t}</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{m.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Alessandra */}
        <section className="bg-white rounded-3xl shadow p-6 border border-pink-100 flex flex-col items-center text-center gap-4">
          <img src={alessandraImg} alt="Alessandra Linhares" className="w-32 h-32 rounded-full object-cover border-4 border-[#d82298]" />
          <div>
            <h3 className="font-black text-xl">Alessandra Linhares</h3>
            <p className="text-sm text-gray-600 mt-2">Cabeleireira profissional com mais de 15 anos de experiência, já formou centenas de alunas em todo o Brasil.</p>
          </div>
        </section>

        {/* Certificados carrossel */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-center uppercase">
            Alunas <span className="text-[#d82298]">certificadas</span>
          </h2>
          <div className="relative bg-white rounded-3xl shadow p-4 border border-pink-100">
            <img src={certificates[slide].src} alt={certificates[slide].name} className="w-full rounded-2xl aspect-[4/3] object-cover" />
            <p className="text-center font-semibold mt-3 text-sm">{certificates[slide].name}</p>
            <div className="flex justify-center gap-2 mt-3">
              {certificates.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition ${i === slide ? "bg-[#d82298] w-6" : "bg-pink-200"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Preços */}
        <section id="precos" className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-black text-center uppercase">
            Escolha como quer <span className="text-[#d82298]">começar hoje</span>
          </h2>

          {/* Card COMBO — mais vendido */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 border-4 border-yellow-300">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-300 text-[#1a1a1a] text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow">⭐ Mais Vendido</span>
            <img src={comboAsset} alt="Combo completo de cursos" className="w-full rounded-2xl bg-black object-contain mb-4" />
            <h3 className="font-black text-lg md:text-xl uppercase">Combo Completo — Todos os Cursos</h3>
            <ul className="text-sm md:text-base mt-3 space-y-1.5">
              {["Cabeleireira Completo","Designer de Sobrancelha","Extensão de Cílios","Marketing p/ Primeiros Clientes"].map((c) => (
                <li key={c} className="flex items-center gap-2 font-semibold"><span className="text-[#d82298]">✓</span>{c}</li>
              ))}
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">Bônus inclusos</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {["Aulas práticas passo a passo","Certificado em até 8 dias","Acesso vitalício","Suporte com a Alessandra","Bônus de lançamento"].map((b) => (
                  <li key={b}>✨ {b}</li>
                ))}
              </ul>
            </div>
            <p className="text-gray-400 line-through mt-4 text-sm">De R$ 497</p>
            <div className="text-5xl md:text-6xl font-black text-green-600 leading-none">R$89</div>
            <p className="text-xs uppercase font-bold text-gray-600 mt-1">Pagamento único • Atualizações vitalícias</p>
            <a href={CHECKOUT} onClick={track} className="block w-full mt-4 bg-gradient-to-b from-green-500 to-green-700 text-white font-black uppercase text-center py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition">
              🛒 QUERO O COMBO — R$89
            </a>
            <p className="text-[11px] text-center text-gray-500 mt-2">✅ Acesso imediato · Garantia 7 dias</p>
          </div>

          {/* Card CURSO — básico */}
          <div className="bg-white rounded-3xl shadow p-6 border-2 border-pink-100">
            <span className="inline-block bg-pink-100 text-[#d82298] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Básico</span>
            <img src={cabeleireiraAsset} alt="Curso de Cabeleireira Completo" className="w-full rounded-2xl bg-black object-contain my-4" />
            <h3 className="font-black text-lg uppercase">Curso de Cabeleireira Completo</h3>
            <p className="text-sm text-gray-600 mt-1">Apenas o curso de Cabeleireira, sem os bônus adicionais.</p>
            <ul className="text-sm mt-3 space-y-1.5">
              {["Aulas práticas passo a passo","Certificado em até 8 dias","Acesso vitalício","Suporte com a Alessandra"].map((c) => (
                <li key={c} className="flex items-center gap-2 font-semibold"><span className="text-[#d82298]">✓</span>{c}</li>
              ))}
            </ul>
            <p className="text-gray-400 line-through mt-4 text-sm">De R$ 197</p>
            <div className="text-4xl font-black text-[#d82298] leading-none">R$25</div>
            <p className="text-xs uppercase font-bold text-gray-600 mt-1">Oferta relâmpago</p>
            <a href={CHECKOUT} onClick={track} className="block w-full mt-4 bg-gradient-to-b from-[#d82298] to-[#a4176f] text-white font-black uppercase text-center py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition">
              QUERO O CURSO — R$25
            </a>
          </div>
        </section>

        {/* Garantia */}
        <section className="bg-white rounded-3xl shadow p-5 border border-pink-100 flex items-center gap-4">
          <div className="text-4xl">🛡️</div>
          <div>
            <h4 className="font-black">Garantia de 7 dias</h4>
            <p className="text-sm text-gray-600">Se não gostar por qualquer motivo, devolvemos 100% do seu dinheiro.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-center uppercase mb-4">
            Dúvidas <span className="text-[#d82298]">frequentes</span>
          </h2>
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 flex items-center justify-between font-bold text-sm md:text-base">
                {f.q}
                <span className="text-[#d82298] text-xl font-black shrink-0 ml-3">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-600">{f.a}</div>
              )}
            </div>
          ))}
        </section>

        {/* Urgência */}
        <section className="bg-[#1a1a1a] text-white text-center rounded-2xl p-4 font-bold text-sm md:text-base">
          ⏰ Não fique esperando — cada dia parada é dinheiro perdido!
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-2">
          <a href={CHECKOUT} onClick={track} className="block w-full bg-gradient-to-b from-[#d82298] to-[#a4176f] text-white font-black uppercase tracking-wide py-5 px-6 rounded-2xl text-lg md:text-xl shadow-[0_10px_30px_rgba(216,34,152,0.4)] hover:scale-[1.02] transition">
            💇‍♀️ QUERO COMEÇAR AGORA
          </a>
          <p className="text-xs text-gray-500">🔒 Acesso imediato • Garantia 7 dias • Pagamento seguro</p>
        </section>

        {/* Segurança */}
        <section className="flex flex-wrap justify-center gap-3 text-xs font-bold text-gray-600">
          <span className="bg-white px-3 py-1.5 rounded-full border border-pink-100">🔒 SSL Seguro</span>
          <span className="bg-white px-3 py-1.5 rounded-full border border-pink-100">💳 Pagamento Protegido</span>
          <span className="bg-white px-3 py-1.5 rounded-full border border-pink-100">📲 Acesso Imediato</span>
        </section>

        <footer className="text-center text-xs text-gray-400 py-6">
          © 2026 · Beleza Liso Perfeito · Todos os direitos reservados
        </footer>
      </main>

    </div>
  );
}

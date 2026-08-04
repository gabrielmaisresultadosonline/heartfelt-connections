import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Scissors, Eye, Flower2 } from "lucide-react";
const cabelereiraProCover = "/api/files/cover-cabelereira-pro-2027.webp";
const ciliosCover = "/curso-cilios.png";
const sobrancelhaCover = "/curso-sobrancelha.png";

export const Route = createFileRoute("/inicio")({
  component: InicioPage,
  head: () => ({
    meta: [
      { title: "Cursos de Beleza — Alisamento, Cílios e Sobrancelha" },
      { name: "description", content: "Escolha seu curso: Alisamento Perfeito, Extensão de Cílios ou Design de Sobrancelha. Certificado incluso." },
    ],
  }),
});

type Curso = {
  slug: string;
  to: "/promocc" | "/promocilius" | "/promosombra" | "/promocabelereira";
  title: string;
  tagline: string;
  price: string;
  image: string;
  icon: React.ReactNode;
  gradient: string;
};

const cursos: Curso[] = [
  {
    slug: "alisamento",
    to: "/promocc",
    title: "Alisamento Perfeito",
    tagline: "Cabelos lisos, brilhosos e sem frizz — técnica profissional passo a passo.",
    price: "R$ 10,00",
    image: "/curso-liso-perfeito.webp",
    icon: <Scissors size={20} />,
    gradient: "from-pink-500 to-fuchsia-600",
  },
  {
    slug: "cabelereira-pro",
    to: "/promocabelereira",
    title: "Cabelereira PRO 2027",
    tagline: "Formação completa premium — o mesmo conteúdo de elite com certificação 2027.",
    price: "R$ 25,00",
    image: cabelereiraProCover,
    icon: <Scissors size={20} />,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    slug: "cilios",
    to: "/promocilius",
    title: "Extensão de Cílios",
    tagline: "Aprenda fio a fio, volume russo e egípcio — do básico ao avançado.",
    price: "R$ 29,00",
    image: ciliosCover,
    icon: <Eye size={20} />,
    gradient: "from-rose-500 to-pink-600",
  },
  {
    slug: "sombrancelha",
    to: "/promosombra",
    title: "Design de Sobrancelha",
    tagline: "Modele com precisão, valorize o olhar e conquiste clientes fiéis.",
    price: "R$ 29,00",
    image: sobrancelhaCover,
    icon: <Flower2 size={20} />,
    gradient: "from-fuchsia-500 to-purple-600",
  },
];

function InicioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-1.5 rounded-full ring-1 ring-pink-200 text-pink-700 text-xs font-bold mb-4">
          <Sparkles size={14} /> ESCOLHA SEU CURSO
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          Transforme sua <span className="text-[#d82298]">paixão</span> em profissão
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Cursos completos, certificado reconhecido e acesso vitalício. Escolha abaixo qual curso combina com você.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {cursos.map((c) => (
            <Link
              key={c.slug}
              to={c.to}
              className="group bg-white rounded-3xl overflow-hidden ring-1 ring-pink-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className={`absolute top-3 left-3 bg-gradient-to-r ${c.gradient} text-white px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-lg`}>
                  {c.icon} Curso
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black text-gray-900">{c.title}</h2>
                <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{c.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 line-through">R$ 197</span>
                    <div className="text-2xl font-black text-[#d82298] leading-none">{c.price}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${c.gradient} text-white font-bold rounded-full px-4 py-2 text-sm shadow-md group-hover:shadow-xl transition`}>
                    Ver oferta <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-sm text-pink-700 hover:text-pink-900 font-bold underline underline-offset-4">
            Já é aluna? Entrar na área de membros
          </Link>
        </div>
      </main>
    </div>
  );
}

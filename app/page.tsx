import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Manifesto } from "@/components/home/Manifesto";
import { Process } from "@/components/home/Process";
import { Differentials } from "@/components/home/Differentials";
import { Showcase } from "@/components/home/Showcase";
import { StoresMapSection } from "@/components/home/StoresMapSection";
import { Faq } from "@/components/home/Faq";
import { Closing } from "@/components/home/Closing";
import { featured, products, shortTitle } from "@/lib/catalog";

// Vitrine: a foto de ambiente mais bonita de cada linha, ligada ao produto em si
const SHOWCASE: { cat: string; match: RegExp; img?: number }[] = [
  { cat: "Cartões de visita", match: /cart[aã]o de visita/i },
  { cat: "Canecas", match: /caneca branca de cer[aâ]mica/i, img: 1 },
  { cat: "Cadernetas", match: /caderneta moleskine capa corino/i, img: 1 },
  { cat: "Camisetas", match: /camiseta.*dry fit/i, img: 1 },
  { cat: "Crachás", match: /crach[aá] em pvc frente/i },
  { cat: "Banners", match: /^banner$/i },
  { cat: "Kit corporativo", match: /kit corporativo/i },
  { cat: "Squeezes e garrafas", match: /squeeze inox/i },
  { cat: "Folders", match: /^folder/i },
];

function showcasePicks() {
  const pool = [...featured(), ...products];
  return SHOWCASE.flatMap(({ cat, match, img }) => {
    const p = pool.find((x) => match.test(x.title));
    if (!p) return [];
    return [{ cat, id: p.id, title: shortTitle(p.title), img: p.images[img ?? 0] ?? p.images[0], price: p.tiers[0].price, qty: p.tiers[0].qty }];
  });
}

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <Marquee />
      <Manifesto />
      <Process />
      <Differentials tiers={(products.find((p) => /crach[aá] em pvc frente/i.test(p.title)) ?? featured()[0]).tiers} />
      <Showcase picks={showcasePicks()} />
      <StoresMapSection />
      <Faq />
      <Closing />
    </div>
  );
}

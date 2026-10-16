// Gera public/search-index.json (índice leve da busca do header) e public/search-cards.json
// (cards completos + texto de busca, usados pela página /busca no cliente) a partir de data/catalog.json.
import { readFileSync, writeFileSync } from "node:fs";
const { products } = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url)));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const index = products.map((p) => ({ id: p.id, t: p.title, c: p.category, p: p.tiers[0]?.price ?? 0, i: p.images[0], s: norm(`${p.title} ${p.category}`) }));
writeFileSync(new URL("../public/search-index.json", import.meta.url), JSON.stringify(index));
const cards = products.map((p) => ({
  id: p.id,
  title: p.title,
  size: p.size,
  category: p.category,
  categorySlug: p.categorySlug,
  tiers: p.tiers,
  productionDays: p.productionDays,
  images: p.images.slice(0, 2),
  paper: p.papers[0] ?? "",
  search: norm(`${p.title} ${p.category} ${p.papers.join(" ")}`),
  hay: norm(`${p.title} ${p.category} ${p.papers.join(" ")} ${p.intro.join(" ")}`),
}));
writeFileSync(new URL("../public/search-cards.json", import.meta.url), JSON.stringify(cards));
console.log("search-index:", index.length, "produtos");

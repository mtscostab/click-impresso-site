// Gera public/search-index.json (índice leve da busca do header) a partir de data/catalog.json.
import { readFileSync, writeFileSync } from "node:fs";
const { products } = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url)));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const index = products.map((p) => ({ id: p.id, t: p.title, c: p.category, p: p.tiers[0]?.price ?? 0, i: p.images[0], s: norm(`${p.title} ${p.category}`) }));
writeFileSync(new URL("../public/search-index.json", import.meta.url), JSON.stringify(index));
console.log("search-index:", index.length, "produtos");

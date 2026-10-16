// Catálogo completo extraído do site atual. Só componentes de servidor importam este arquivo;
// o navegador recebe apenas os recortes que cada página precisa (veja toCard).
import catalogJson from "@/data/catalog.json";
import type { CardProduct, Category, Product } from "./format";
import { normalize } from "./format";

export * from "./format";

type Raw = {
  products: Product[];
  categories: (Category & { productIds: string[]; sourceUrl: string })[];
  featured: string[];
};

const data = catalogJson as unknown as Raw;

export const products = data.products;
const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string) {
  return byId.get(id);
}

export function toCard(p: Product): CardProduct {
  return {
    id: p.id,
    title: p.title,
    size: p.size,
    category: p.category,
    categorySlug: p.categorySlug,
    tiers: p.tiers,
    productionDays: p.productionDays,
    images: p.images.slice(0, 2),
    paper: p.papers[0] ?? "",
    search: normalize(`${p.title} ${p.category} ${p.papers.join(" ")}`),
  };
}

export function allCategories(kind?: Category["kind"]): Category[] {
  return data.categories
    .filter((c) => !kind || c.kind === kind)
    .map(({ productIds: _ids, sourceUrl: _src, ...c }) => c);
}

export function getCategory(slug: string, kind: Category["kind"]) {
  return data.categories.find((c) => c.slug === slug && c.kind === kind);
}

export function productsOf(slug: string, kind: Category["kind"]) {
  const c = getCategory(slug, kind);
  return c ? c.productIds.map((id) => byId.get(id)!).filter(Boolean) : [];
}

export function featured() {
  return data.featured.map((id) => byId.get(id)!).filter(Boolean);
}

export function related(p: Product, limit = 10) {
  const same = productsOf(p.categorySlug, "categoria").filter((x) => x.id !== p.id);
  const rest = featured().filter((x) => x.id !== p.id && x.categorySlug !== p.categorySlug);
  return [...same, ...rest].slice(0, limit);
}

export function search(q: string) {
  const words = normalize(q.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products.filter((p) => {
    const hay = normalize(`${p.title} ${p.category} ${p.papers.join(" ")} ${p.intro.join(" ")}`);
    return words.every((w) => hay.includes(w));
  });
}

/** Índice leve para a busca do header (servido como JSON estático). */
export function searchIndex() {
  return products.map((p) => ({
    id: p.id,
    t: p.title,
    c: p.category,
    p: p.tiers[0]?.price ?? 0,
    i: p.images[0],
    s: normalize(`${p.title} ${p.category}`),
  }));
}

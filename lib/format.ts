// Funções e tipos leves, seguros para componentes de cliente (sem os dados do catálogo).

export type Tier = { qty: number; price: number };
export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  key: string;
  title: string;
  size: string;
  category: string;
  categorySlug: string;
  categories: string[];
  segments: string[];
  intro: string[];
  specs: Spec[];
  info: string[];
  tiers: Tier[];
  productionDays: number | null;
  papers: string[];
  finishes: string[];
  colors: string;
  images: string[];
};

/** O mínimo que um card de produto precisa; é o que viaja para o navegador nas listas. */
export type CardProduct = Pick<Product, "id" | "title" | "size" | "category" | "categorySlug" | "tiers" | "productionDays" | "images"> & {
  paper: string;
  search: string;
};

export type Category = {
  slug: string;
  name: string;
  kind: "categoria" | "segmento";
  count: number;
  cover: string;
  minPrice: number | null;
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number) {
  return brl.format(value);
}

export function unitPrice(tier: Tier) {
  return tier.price / tier.qty;
}

export function startingTier(p: { tiers: Tier[] }) {
  return p.tiers[0];
}

export function maxSavings(p: { tiers: Tier[] }) {
  if (p.tiers.length < 2) return 0;
  const first = unitPrice(p.tiers[0]);
  const last = unitPrice(p.tiers[p.tiers.length - 1]);
  return Math.round((1 - last / first) * 100);
}

export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function addBusinessDays(days: number, from = new Date()) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

/** Tira o "(ESCOLHA SUA COR)" gritado do cadastro original nos títulos de card. */
export function shortTitle(title: string) {
  return title.replace(/\s*\((ESCOLHA|ECOLHA) SUA COR\)/i, "").replace(/\s+/g, " ").trim();
}

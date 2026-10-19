import coords from "@/data/store-coords.json";

export type Store = {
  name: string;
  address: string;
  phone: string;
  email: string;
  region: "Porto Alegre" | "Região Metropolitana" | "Curitiba";
  /** [lng, lat] geocodificado via OpenStreetMap; Anita e Canoas aproximados pela rua */
  coords?: [number, number];
};

// Lista de lojas exatamente como publicada no rodapé de clickimpresso.com.br
export const stores: Store[] = [
  { name: "E-commerce / Loja Protásio Alves", address: "Av. Protásio Alves 6485, Porto Alegre - RS", phone: "+55 51 3181-2350", email: "atendimento@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Assis Brasil", address: "Av. Assis Brasil 3205, Porto Alegre - RS", phone: "+55 51 3181-2338", email: "assisbrasil@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Nilo Peçanha", address: "Av. Nilo Peçanha 2469, Porto Alegre - RS", phone: "+55 51 3181-2353", email: "nilo@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Zona Sul", address: "Av. Wenceslau 2170, Porto Alegre - RS", phone: "+55 51 3181-2334", email: "wenceslau@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Centro", address: "Rua dos Andradas 1159, Porto Alegre - RS", phone: "+55 51 3181-2336", email: "andradas@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Shopping TOTAL", address: "Cristóvão Colombo, 545, Loja 1058 - Porto Alegre - RS", phone: "+55 51 3181-2345", email: "total@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Ipiranga (Santana)", address: "Av. Barão do Amazonas 1364 - Porto Alegre (Esquina com Av. Ipiranga)", phone: "+55 51 3181-2351", email: "ipiranga@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Anita (Mont'Serrat)", address: "Anita Garibaldi, 637 - Porto Alegre", phone: "+55 51 3181-2342", email: "anita@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Goethe (Rio Branco)", address: "Av. Goethe, 74 - Porto Alegre", phone: "+55 51 3181-2343", email: "goethe@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Azenha", address: "Av. Azenha, 1350 - Porto Alegre", phone: "+55 51 3181-2339", email: "azenha@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Osvaldo Aranha", address: "Av. Osvaldo Aranha, 1234 - Porto Alegre", phone: "+55 51 3181-2340", email: "osvaldoaranha@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Cristóvão Colombo", address: "Cristóvão Colombo 2572 - Porto Alegre", phone: "+55 51 3181-2344", email: "cristovao@clickimpresso.com.br", region: "Porto Alegre" },
  { name: "Loja Canoas", address: "Rua Victor Barreto, 2100 - Canoas - RS", phone: "+55 51 3181-2333", email: "canoas@clickimpresso.com.br", region: "Região Metropolitana" },
  { name: "Loja Cachoeirinha (Vila Marcia)", address: "Av. Fernando Ferrari, 50 - Loja 06 - Cachoeirinha, RS", phone: "+55 51 3181-2341", email: "cachoeirinha@clickimpresso.com.br", region: "Região Metropolitana" },
  { name: "Loja Gravataí (Centro)", address: "Av. Dorival Cândido Luz de Oliveira, 237 - Gravataí, RS", phone: "+55 51 3181-2337", email: "gravatai@clickimpresso.com.br", region: "Região Metropolitana" },
  { name: "Loja Novo Hamburgo", address: "Av. Nicolau Becker, 644", phone: "+55 51 3181-2335", email: "novohamburgo@clickimpresso.com.br", region: "Região Metropolitana" },
  { name: "Loja São Leopoldo", address: "Av. João Correa, 265 - Loja 03", phone: "+55 51 3181-2352", email: "saoleopoldo@clickimpresso.com.br", region: "Região Metropolitana" },
  { name: "Loja Curitiba (Água Verde)", address: "Av. Iguaçu, 2289 (Água Verde)", phone: "+55 41 2018-7248", email: "curitiba@clickimpresso.com.br", region: "Curitiba" },
];

for (const s of stores) s.coords = (coords as unknown as Record<string, [number, number]>)[s.email];

/** Cidade de cada loja, a partir do endereço publicado. */
export function cityOf(s: Store) {
  if (s.region === "Curitiba") return "Curitiba";
  const known = ["Canoas", "Cachoeirinha", "Gravataí", "Novo Hamburgo", "São Leopoldo"];
  const fromName = known.find((c) => s.name.includes(c) || s.address.includes(c));
  return fromName ?? "Porto Alegre";
}

export const cities = [...new Set(stores.map(cityOf))];

export const whatsapp = [
  { label: "Porto Alegre", display: "(51) 8181-8899", href: "https://wa.me/555181818899" },
  { label: "Curitiba", display: "(41) 9718-2096", href: "https://wa.me/554197182096" },
  { label: "Demais municípios", display: "(51) 8181-8899", href: "https://wa.me/555181818899" },
  { label: "Atendimento do site", display: "(51) 9533-4083", href: "https://wa.me/555195334083" },
  { label: "Click Atacado", display: "(51) 9533-4083", href: "https://wa.me/555195334083" },
];

export const SITE_WHATSAPP = "https://wa.me/555195334083";

export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

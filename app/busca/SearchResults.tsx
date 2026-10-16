"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { normalize, type CardProduct } from "@/lib/format";

type SearchCard = CardProduct & { hay: string };

let cardsPromise: Promise<SearchCard[]> | null = null;
function loadCards() {
  cardsPromise ??= fetch("/search-cards.json").then((r) => r.json());
  return cardsPromise;
}

/** Resultados da busca: filtrados no navegador a partir de search-cards.json (permite exportar o site como estático). */
export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const [cards, setCards] = useState<SearchCard[] | null>(null);

  useEffect(() => {
    if (q) loadCards().then(setCards);
  }, [q]);

  const words = normalize(q).split(/\s+/).filter(Boolean);
  const found = cards && words.length ? cards.filter((c) => words.every((w) => c.hay.includes(w))) : [];

  return (
    <>
      <header className="listing-head">
        <nav className="crumbs" aria-label="Você está em">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/produtos">Produtos</Link>
            </li>
            <li aria-current="page">Busca</li>
          </ol>
        </nav>
        <h1 className="display">{q ? `“${q}”` : "Buscar produtos"}</h1>
        <p className="lede num">
          {!q
            ? "Use a busca no topo da página."
            : !cards
              ? "Buscando…"
              : `${found.length} ${found.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
        </p>
      </header>
      {q && cards && <Catalog key={q} items={found} groupByCategory />}
    </>
  );
}

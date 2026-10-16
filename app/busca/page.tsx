import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { search, toCard } from "@/lib/catalog";

export const metadata: Metadata = { title: "Busca" };

async function Results({ searchParams }: { searchParams: PageProps<"/busca">["searchParams"] }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const found = search(q);
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
          {q ? `${found.length} ${found.length === 1 ? "produto encontrado" : "produtos encontrados"}` : "Use a busca no topo da página."}
        </p>
      </header>
      {q && <Catalog key={q} items={found.map(toCard)} groupByCategory />}
    </>
  );
}

export default function Page({ searchParams }: PageProps<"/busca">) {
  return (
    <div className="wrap listing">
      <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

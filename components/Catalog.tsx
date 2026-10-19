"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icon";
import { Select } from "./ui/Select";
import { normalize, startingTier, unitPrice, type CardProduct } from "@/lib/format";

type Sort = "relevancia" | "menor" | "maior" | "prazo" | "unidade";

const PAGE = 24;

/** Lista de produtos de uma categoria, segmento ou busca: filtro por texto, ordenação e "ver mais". */
export function Catalog({ items, groupByCategory = false }: { items: CardProduct[]; groupByCategory?: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<Sort>("relevancia");
  const [shown, setShown] = useState(PAGE);

  const cats = useMemo(() => {
    if (!groupByCategory) return [];
    const m = new Map<string, number>();
    items.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items, groupByCategory]);

  const list = useMemo(() => {
    const words = normalize(q.trim()).split(/\s+/).filter(Boolean);
    const out = items.filter((p) => (!cat || p.category === cat) && words.every((w) => p.search.includes(w)));
    const by = [...out];
    if (sort === "menor") by.sort((a, b) => startingTier(a).price - startingTier(b).price);
    if (sort === "maior") by.sort((a, b) => startingTier(b).price - startingTier(a).price);
    if (sort === "prazo") by.sort((a, b) => (a.productionDays ?? 99) - (b.productionDays ?? 99));
    if (sort === "unidade") by.sort((a, b) => unitPrice(a.tiers[a.tiers.length - 1]) - unitPrice(b.tiers[b.tiers.length - 1]));
    return by;
  }, [items, q, cat, sort]);

  return (
    <>
      <div className="toolbar">
        <label className="filter-input">
          <Icon name="search" />
          <span className="visually-hidden">Filtrar nesta lista</span>
          <input
            type="search"
            placeholder="Filtrar por nome, papel ou tamanho"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
          />
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span className="result-count num" aria-live="polite">
            {list.length} {list.length === 1 ? "produto" : "produtos"}
          </span>
          <Select
            className="sort-sel"
            label="Ordenar produtos"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={[
              { value: "relevancia", label: "Relevância" },
              { value: "menor", label: "Menor preço inicial" },
              { value: "maior", label: "Maior preço inicial" },
              { value: "unidade", label: "Menor preço por unidade" },
              { value: "prazo", label: "Menor prazo" },
            ]}
          />
        </div>
      </div>

      {cats.length > 1 && (
        <div className="cat-chips" role="group" aria-label="Filtrar por categoria">
          <button className="cat-chip" aria-pressed={!cat} onClick={() => setCat("")}>
            Todas <small className="num">{items.length}</small>
          </button>
          {cats.map(([name, n]) => (
            <button key={name} className="cat-chip" aria-pressed={cat === name} onClick={() => setCat(cat === name ? "" : name)}>
              {name} <small className="num">{n}</small>
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty-state">
          <h2 className="h-sub">Nenhum produto com esse filtro.</h2>
          <p className="lede">Tente outra palavra. Se não achar o que procura, a equipe faz orçamento sob medida.</p>
          <button
            className="btn"
            onClick={() => {
              setQ("");
              setCat("");
            }}
          >
            Limpar filtro
          </button>
        </div>
      ) : (
        <>
          <div className="imposition">
            <div className="grid-products">
              {list.slice(0, shown).map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </div>
          {shown < list.length && (
            <div className="more-row">
              <button className="btn btn-ghost btn-lg" onClick={() => setShown((s) => s + PAGE)}>
                Ver mais {Math.min(PAGE, list.length - shown)} de {list.length - shown}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

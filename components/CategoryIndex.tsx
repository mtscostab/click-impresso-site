"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { normalize, type Category } from "@/lib/format";

/** Índice A–Z de todas as categorias do catálogo, com filtro. */
export function CategoryIndex({ categories }: { categories: Category[] }) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const term = normalize(q.trim());
    const list = categories.filter((c) => !term || normalize(c.name).includes(term));
    const map = new Map<string, Category[]>();
    for (const c of list) {
      const letter = normalize(c.name)[0].toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), c]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([l, items]) => [l, [...items].sort((x, y) => x.name.localeCompare(y.name, "pt-BR"))] as const);
  }, [q, categories]);

  const total = groups.reduce((n, [, l]) => n + l.length, 0);

  return (
    <div className="index">
      <div className="index-side">
        <h2 className="display h-section">Tudo o que a gente imprime</h2>
        <p className="lede">
          {categories.length} linhas de produto, de cartão de visita a fachada. Filtre pelo nome e entre na categoria.
        </p>
        <label className="filter-input">
          <Icon name="search" />
          <span className="visually-hidden">Filtrar categorias</span>
          <input type="search" placeholder="Filtrar categorias" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <p className="result-count num" aria-live="polite">
          {total} {total === 1 ? "categoria" : "categorias"}
        </p>
      </div>
      <div>
        {total === 0 ? (
          <p className="index-empty">
            Nenhuma categoria com “{q}”. Tente a <Link href={`/busca?q=${encodeURIComponent(q)}`}>busca de produtos</Link>.
          </p>
        ) : (
          <ul className="index-list">
            {groups.map(([letter, list]) => (
              <li key={letter}>
                <div className="index-letter" aria-hidden="true">
                  {letter}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {list.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/categoria/${c.slug}`}>
                        {c.name}
                        <small>
                          <span className="here num">{c.count}</span>
                        </small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

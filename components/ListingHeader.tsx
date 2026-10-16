import Link from "next/link";
import type { Category } from "@/lib/format";
import { formatBRL } from "@/lib/format";

export function ListingHeader({ c, crumb }: { c: Category; crumb: string }) {
  return (
    <header className="listing-head">
      <nav className="crumbs" aria-label="Você está em">
        <ol>
          <li>
            <Link href="/">Início</Link>
          </li>
          <li>
            <Link href="/produtos">Produtos</Link>
          </li>
          <li>{crumb}</li>
          <li aria-current="page">{c.name}</li>
        </ol>
      </nav>
      <div className="listing-title">
        <div>
          <h1 className="display">{c.name}</h1>
          <p className="lede num">
            {c.count} {c.count === 1 ? "produto" : "produtos"}
            {c.minPrice != null && <> · a partir de {formatBRL(c.minPrice)}</>}
          </p>
        </div>
        <img src={c.cover} alt="" width={160} height={160} className="listing-cover" />
      </div>
    </header>
  );
}

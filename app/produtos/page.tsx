import type { Metadata } from "next";
import Link from "next/link";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryIndex } from "@/components/CategoryIndex";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";
import { banners } from "@/lib/banners";
import { allCategories, featured, formatBRL, toCard } from "@/lib/catalog";

export const metadata: Metadata = { title: "Produtos" };

const dot = ["var(--cyan)", "var(--magenta)", "var(--yellow)", "var(--ink)"];

export default function ProductsPage() {
  const cats = allCategories("categoria");
  const segs = allCategories("segmento");
  const top = [...cats].filter((c) => c.slug !== "promocao" && c.slug !== "lancamentos").sort((a, b) => b.count - a.count).slice(0, 12);
  const highlights = cats.filter((c) => c.slug === "promocao" || c.slug === "lancamentos");
  return (
    <div className="retail">
      <div className="wrap retail-hero">
        <BannerCarousel banners={banners} />
        <nav className="seg-row" aria-label="Produtos por segmento">
          {segs.map((t, i) => (
            <Link key={t.slug} href={`/segmento/${t.slug}`}>
              <b style={{ background: dot[i % 4] }} />
              {t.name}
            </Link>
          ))}
        </nav>
      </div>

      <section className="wrap retail-sec" aria-labelledby="cat-title">
        <div className="sec-head">
          <h1 className="display" id="cat-title">
            Categorias
          </h1>
          <div className="retail-quick">
            {highlights.map((h) => (
              <Link key={h.slug} href={`/categoria/${h.slug}`} className="btn btn-ghost">
                {h.name} <span className="num">({h.count})</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="cat-tiles">
          {top.map((c) => (
            <Link key={c.slug} className="cat-tile" href={`/categoria/${c.slug}`}>
              <img src={c.cover} alt="" loading="lazy" width={300} height={300} />
              <span>
                {c.name}
                <small className="num">
                  {c.count} {c.count === 1 ? "produto" : "produtos"}
                  {c.minPrice != null && ` · a partir de ${formatBRL(c.minPrice)}`}
                </small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap retail-sec" aria-label="Índice de categorias">
        <div className="sheet" style={{ padding: "clamp(24px, 4vw, 56px)" }}>
          <CategoryIndex categories={cats} />
        </div>
      </section>

      <section className="wrap retail-sec" aria-labelledby="mais-title">
        <div className="sec-head">
          <h2 className="display h-section" id="mais-title">
            Mais pedidos
          </h2>
          <Link className="link-arrow" href="/busca?q=promocional">
            Ver promocionais <Icon name="arrowRight" size={18} />
          </Link>
        </div>
        <div className="imposition">
          <div className="grid-products">
            {featured()
              .slice(0, 8)
              .map((p, i) => (
                <ProductCard key={p.id} product={toCard(p)} priority={i < 4} />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

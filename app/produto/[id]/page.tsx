import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Configurator, PriceTable, TierProvider } from "@/components/product/Configurator";
import { ProductRail } from "@/components/product/ProductRail";
import { CropMarks, Swatches } from "@/components/Marks";
import { Icon } from "@/components/Icon";
import { getProduct, products, related, shortTitle, toCard } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/produto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  return { title: shortTitle(p.title), description: p.intro[0] };
}

export default function ProductPage({ params }: PageProps<"/produto/[id]">) {
  return (
    <Suspense fallback={<div className="wrap" style={{ minHeight: "80vh" }} />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/produto/[id]">["params"] }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const title = shortTitle(product.title);
  const specs = [
    ...product.specs,
    ...(product.size && !product.specs.some((s) => /tamanho|formato|medida/i.test(s.label))
      ? [{ label: "Formato", value: product.size }]
      : []),
    ...(product.colors && !product.specs.some((s) => /impress|cores/i.test(s.label))
      ? [{ label: "Impressão", value: product.colors }]
      : []),
    ...(product.productionDays && !product.specs.some((s) => /prazo/i.test(s.label))
      ? [{ label: "Prazo de produção", value: `${product.productionDays} ${product.productionDays === 1 ? "dia útil" : "dias úteis"}` }]
      : []),
  ];
  const intro = product.intro.filter((p) => p.trim() && p.trim() !== title);

  return (
    <TierProvider>
      <div className="wrap">
        <nav className="crumbs" aria-label="Você está em">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/produtos">Produtos</Link>
            </li>
            <li>
              <Link href={`/categoria/${product.categorySlug}`}>{product.category}</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>

        <div className="pdp">
          <div className="pdp-media">
            <ProductGallery images={product.images} title={title} />
          </div>
          <div>
            <div className="buy-title" style={{ marginBottom: 26 }}>
              <h1 className="display">{title}</h1>
              <div className="chips">
                {product.size && <span className="chip">{product.size}</span>}
                {product.colors && <span className="chip">{product.colors}</span>}
              </div>
            </div>
            <Configurator product={product} />
          </div>
        </div>
      </div>

      <section className="details" aria-label="Detalhes do produto">
        <div className="wrap details-grid">
          <div className="prose">
            <h2 className="display h-section" style={{ marginBottom: 10 }}>
              Sobre o produto
            </h2>
            {intro.length > 0 ? intro.map((p, i) => <p key={i}>{p}</p>) : <p>{product.title}</p>}
            {product.info.length > 0 && (
              <>
                <h3 className="h-sub" style={{ marginTop: 18 }}>
                  Informações importantes
                </h3>
                <ul className="info-list">
                  {product.info.map((x) => (
                    <li key={x}>
                      <Icon name="check" size={18} />
                      {x}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div style={{ display: "grid", gap: 56 }}>
            {specs.length > 0 && (
              <div className="ticket">
                <CropMarks />
                <div className="ticket-head">
                  <h2>Especificações</h2>
                  <Swatches />
                </div>
                <table className="spec-table">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={`${i}-${s.label}`}>
                        <th scope="row">{s.label}</th>
                        <td>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <PriceTable product={product} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="relacionados">
        <div className="wrap">
          <ProductRail products={related(product).map(toCard)} titleId="relacionados" title="Quem levou este também viu" />
        </div>
      </section>
    </TierProvider>
  );
}

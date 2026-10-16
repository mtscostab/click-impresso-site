import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { ListingHeader } from "@/components/ListingHeader";
import { allCategories, getCategory, productsOf, toCard } from "@/lib/catalog";

export function generateStaticParams() {
  return allCategories("segmento").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/segmento/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug, "segmento");
  return c ? { title: c.name } : {};
}

async function Content({ params }: { params: PageProps<"/segmento/[slug]">["params"] }) {
  const { slug } = await params;
  const c = getCategory(slug, "segmento");
  if (!c) notFound();
  const { productIds: _ids, sourceUrl: _src, ...cat } = c;
  return (
    <>
      <ListingHeader c={cat} crumb="Segmentos" />
      <Catalog items={productsOf(slug, "segmento").map(toCard)} groupByCategory />
    </>
  );
}

export default function Page({ params }: PageProps<"/segmento/[slug]">) {
  return (
    <div className="wrap listing">
      <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
        <Content params={params} />
      </Suspense>
    </div>
  );
}

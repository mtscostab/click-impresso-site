import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { ListingHeader } from "@/components/ListingHeader";
import { allCategories, getCategory, productsOf, toCard } from "@/lib/catalog";

export function generateStaticParams() {
  return allCategories("categoria").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategory(slug, "categoria");
  return c ? { title: c.name } : {};
}

async function Content({ params }: { params: PageProps<"/categoria/[slug]">["params"] }) {
  const { slug } = await params;
  const c = getCategory(slug, "categoria");
  if (!c) notFound();
  const { productIds: _ids, sourceUrl: _src, ...cat } = c;
  return (
    <>
      <ListingHeader c={cat} crumb="Categorias" />
      <Catalog items={productsOf(slug, "categoria").map(toCard)} />
    </>
  );
}

export default function Page({ params }: PageProps<"/categoria/[slug]">) {
  return (
    <div className="wrap listing">
      <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
        <Content params={params} />
      </Suspense>
    </div>
  );
}

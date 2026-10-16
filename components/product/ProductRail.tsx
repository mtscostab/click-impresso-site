"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "../ProductCard";
import { Icon } from "../Icon";
import type { CardProduct } from "@/lib/format";

export function ProductRail({ products, title, titleId }: { products: CardProduct[]; title: string; titleId: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <>
      <div className="rail-head">
        <h2 className="display h-section" id={titleId}>
          {title}
        </h2>
        <div className="carousel-nav">
          <button className="square-btn" aria-label="Anteriores" disabled={edges.start} onClick={() => scroll(-1)}>
            <Icon name="arrowLeft" />
          </button>
          <button className="square-btn" aria-label="Próximos" disabled={edges.end} onClick={() => scroll(1)}>
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>
      <div className="rail" ref={rail}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

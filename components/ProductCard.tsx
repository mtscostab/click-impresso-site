"use client";

import Link from "next/link";
import { useState } from "react";
import { CropMarks } from "./Marks";
import { Icon } from "./Icon";
import { useCart } from "@/lib/cart";
import { formatBRL, maxSavings, shortTitle, startingTier, unitPrice, type CardProduct } from "@/lib/format";

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const { add, notify } = useCart();
  const [done, setDone] = useState(false);
  const tier = startingTier(product);
  const savings = maxSavings(product);
  const title = shortTitle(product.title);

  function quickAdd() {
    add({
      productId: product.id,
      title,
      image: product.images[0],
      paper: product.paper,
      finishes: [],
      tier,
      tiers: product.tiers,
      productionDays: product.productionDays,
    });
    notify({ message: `${title} · ${tier.qty} un. adicionado ao carrinho.` });
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <article className="card">
      <CropMarks />
      <div className="card-media">
        {savings >= 10 && <span className="badge-save num">até −{savings}%/un</span>}
        <img
          className="main"
          src={product.images[0]}
          alt=""
          width={500}
          height={500}
          loading={priority ? "eager" : "lazy"}
        />
        {product.images[1] && (
          <img className="alt" src={product.images[1]} alt="" width={500} height={500} loading="lazy" />
        )}
      </div>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-title">
          <Link href={`/produto/${product.id}`}>{title}</Link>
        </h3>
        <div className="card-meta">
          {product.productionDays && (
            <span>
              <Icon name="clock" size={14} /> {product.productionDays} {product.productionDays === 1 ? "dia útil" : "dias úteis"}
            </span>
          )}
          {product.size && <span>{product.size}</span>}
        </div>
      </div>
      <div className="card-foot">
        <div className="price-from">
          <small className="num">{tier.qty} un. por</small>
          <strong className="num">{formatBRL(tier.price)}</strong>
          {tier.qty > 1 && <em className="num">{formatBRL(unitPrice(tier))}/un</em>}
        </div>
        <button
          className={`quick-add${done ? " done" : ""}`}
          onClick={quickAdd}
          aria-label={`Adicionar ${title}, ${tier.qty} unidades, ao carrinho`}
        >
          <Icon name={done ? "check" : "plus"} />
        </button>
      </div>
    </article>
  );
}

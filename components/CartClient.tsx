"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatBRL, unitPrice, type CardProduct } from "@/lib/format";
import { cities, cityOf, stores } from "@/lib/stores";
import { Select } from "./ui/Select";
import { CropMarks } from "./Marks";
import { Icon } from "./Icon";
import { ProductRail } from "./product/ProductRail";

export function CartClient({ suggestions }: { suggestions: CardProduct[] }) {
  const { items, ready, subtotal, remove, updateTier } = useCart();
  const [delivery, setDelivery] = useState<"retirada" | "entrega">("retirada");
  const [city, setCity] = useState(cities[0]);
  const [store, setStore] = useState(stores[0].name);
  const cityStores = stores.filter((s) => cityOf(s) === city);
  const [checkoutNote, setCheckoutNote] = useState(false);

  const longest = items.reduce((m, i) => Math.max(m, i.productionDays ?? 0), 0);

  return (
    <div className="wrap">
      <header className="page-hero" style={{ paddingBottom: 24 }}>
        <h1 className="display">Meu carrinho</h1>
        {ready && items.length > 0 && (
          <p className="lede num">
            {items.length} {items.length === 1 ? "pedido" : "pedidos"} · prazo de produção de até {longest}{" "}
            {longest === 1 ? "dia útil" : "dias úteis"}
          </p>
        )}
      </header>

      {!ready ? (
        <p className="lede" style={{ paddingBottom: 80 }}>Carregando carrinho…</p>
      ) : items.length === 0 ? (
        <>
          <div className="text-sheet" style={{ marginBottom: 64 }}>
            <CropMarks />
            <h2 className="h-sub">O carrinho está vazio.</h2>
            <p>Escolha um produto, defina material e quantidade e ele aparece aqui com preço e prazo.</p>
            <div>
              <Link className="btn btn-primary btn-lg" href="/produtos">
                Ver produtos <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </div>
          <section className="section" style={{ paddingTop: 0 }} aria-labelledby="sugestoes">
            <ProductRail products={suggestions} title="Mais pedidos" titleId="sugestoes" />
          </section>
        </>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((item) => {
              const tiers = item.tiers ?? [item.tier];
              return (
                <li className="line" key={item.key}>
                  <img src={item.image} alt="" width={120} height={120} />
                  <div>
                    <h2>
                      <Link href={`/produto/${item.productId}`}>{item.title}</Link>
                    </h2>
                    <dl>
                      {item.paper && (
                        <>
                          <dt>Material</dt>
                          <dd>{item.paper}</dd>
                        </>
                      )}
                      {item.finishes.length > 0 && (
                        <>
                          <dt>Extras</dt>
                          <dd>{item.finishes.join(", ")} (valor no orçamento)</dd>
                        </>
                      )}
                      {item.productionDays && (
                        <>
                          <dt>Produção</dt>
                          <dd>
                            {item.productionDays} {item.productionDays === 1 ? "dia útil" : "dias úteis"}
                          </dd>
                        </>
                      )}
                    </dl>
                    <div className="line-controls">
                      <Select
                        size="sm"
                        label="Quantidade"
                        value={String(item.tier.qty)}
                        options={tiers.map((t) => ({
                          value: String(t.qty),
                          label: `${t.qty.toLocaleString("pt-BR")} un · ${formatBRL(t.price)}`,
                          hint: `${formatBRL(unitPrice(t))} por unidade`,
                        }))}
                        onChange={(v) => {
                          const t = tiers.find((x) => x.qty === Number(v));
                          if (t) updateTier(item.key, t);
                        }}
                      />
                    </div>
                  </div>
                  <div className="line-price">
                    <div>
                      <strong className="num">{formatBRL(item.tier.price)}</strong>
                      <br />
                      <small className="num">{formatBRL(unitPrice(item.tier))}/un</small>
                    </div>
                    <button className="remove" onClick={() => remove(item.key)}>
                      <Icon name="trash" size={16} /> Remover
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="summary" aria-labelledby="resumo">
            <CropMarks />
            <div className="summary-inner">
              <h2 className="h-sub" id="resumo">
                Resumo
              </h2>
              <div className="summary-rows">
                <div>
                  <span>Produtos</span>
                  <span className="num">{formatBRL(subtotal)}</span>
                </div>
                <div>
                  <span>{delivery === "retirada" ? "Retirada na loja" : "Entrega"}</span>
                  <span>{delivery === "retirada" ? "Grátis" : "Calculada no fechamento"}</span>
                </div>
              </div>

              <div className="delivery" role="radiogroup" aria-label="Como receber">
                <label className="option">
                  <input type="radio" name="entrega" checked={delivery === "retirada"} onChange={() => setDelivery("retirada")} />
                  <span className="dot" aria-hidden="true" />
                  <span>
                    <Icon name="store" size={16} /> Retirar numa loja Click
                  </span>
                </label>
                {delivery === "retirada" && (
                  <div className="pickup">
                    <Select
                      label="Cidade"
                      value={city}
                      options={cities.map((c) => {
                        const n = stores.filter((s) => cityOf(s) === c).length;
                        return { value: c, label: c, hint: `${n} ${n === 1 ? "loja" : "lojas"}` };
                      })}
                      onChange={(c) => {
                        setCity(c);
                        setStore(stores.find((s) => cityOf(s) === c)!.name);
                      }}
                    />
                    <Select
                      label="Loja"
                      value={store}
                      options={cityStores.map((s) => ({ value: s.name, label: s.name, hint: s.address }))}
                      onChange={setStore}
                    />
                  </div>
                )}
                <label className="option">
                  <input type="radio" name="entrega" checked={delivery === "entrega"} onChange={() => setDelivery("entrega")} />
                  <span className="dot" aria-hidden="true" />
                  <span>
                    <Icon name="truck" size={16} /> Receber em casa (todo o Brasil)
                  </span>
                </label>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong className="num">{formatBRL(subtotal)}</strong>
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setCheckoutNote(true)}>
                Finalizar compra
              </button>
              {checkoutNote && (
                <p className="notice" role="status">
                  <Icon name="info" size={18} />
                  O fechamento do pedido exige login, que fica fora deste protótipo. Seu carrinho continua salvo neste
                  navegador.
                </p>
              )}
              <Link className="link-arrow" href="/produtos" style={{ justifySelf: "start" }}>
                Continuar comprando <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

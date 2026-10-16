"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CropMarks, Swatches } from "../Marks";
import { Icon, WhatsappIcon } from "../Icon";
import { useCart } from "@/lib/cart";
import {
  addBusinessDays,
  formatBRL,
  formatDay,
  shortTitle,
  unitPrice,
  type Product,
} from "@/lib/format";
import { SITE_WHATSAPP } from "@/lib/stores";

type Ctx = { tierIndex: number; setTierIndex: (i: number) => void };
const TierContext = createContext<Ctx | null>(null);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tierIndex, setTierIndex] = useState(0);
  return <TierContext.Provider value={{ tierIndex, setTierIndex }}>{children}</TierContext.Provider>;
}

function useTier() {
  const c = useContext(TierContext);
  if (!c) throw new Error("TierProvider ausente");
  return c;
}

/** Cor aproximada para opções que trazem a cor no nome ("PRETO", "Kraft"...). */
const COLOR_WORDS: [RegExp, string][] = [
  [/\bpret[oa]\b/i, "#1b1b1b"],
  [/\bbranc[oa]\b/i, "#ffffff"],
  [/\bazul\b/i, "#1f4fa3"],
  [/\bverde\b/i, "#2f8a4a"],
  [/\brosa\b/i, "#f08cb6"],
  [/\bkraft\b/i, "#c49a6c"],
  [/\bvermelh[oa]\b/i, "#c62828"],
  [/\bcinza\b/i, "#9a9a9a"],
];
function colorOf(label: string) {
  return COLOR_WORDS.find(([re]) => re.test(label))?.[1];
}

function ProductionDate({ days }: { days: number }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => setLabel(formatDay(addBusinessDays(days))), [days]);
  return (
    <>
      Pronto em <b>{days} {days === 1 ? "dia útil" : "dias úteis"}</b>
      {label && <> · previsão {label}, após aprovação da arte</>}
    </>
  );
}

export function Configurator({ product }: { product: Product }) {
  const { add, notify } = useCart();
  const { tierIndex, setTierIndex } = useTier();
  const [paper, setPaper] = useState(product.papers[0] ?? "");
  const [finishes, setFinishes] = useState<string[]>([]);
  const [showSticky, setShowSticky] = useState(false);
  const [added, setAdded] = useState(false);
  const cta = useRef<HTMLDivElement>(null);
  const title = shortTitle(product.title);

  const tiers = product.tiers;
  const tier = tiers[tierIndex];
  const firstUnit = unitPrice(tiers[0]);
  const unit = unitPrice(tier);
  const saving = Math.round((1 - unit / firstUnit) * 100);
  const maxUnit = Math.max(...tiers.map(unitPrice));
  const bestIndex = tiers.length - 1;

  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    document.body.classList.add("has-sticky");
    return () => {
      io.disconnect();
      document.body.classList.remove("has-sticky");
    };
  }, []);

  const colored = useMemo(() => product.papers.some((p) => colorOf(p)), [product.papers]);

  function addToCart() {
    add({
      productId: product.id,
      title,
      image: product.images[0],
      paper,
      finishes,
      tier,
      tiers: product.tiers,
      productionDays: product.productionDays,
    });
    notify({ message: `${title} · ${tier.qty} un. por ${formatBRL(tier.price)} no carrinho.` });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function onTierKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setTierIndex(Math.min(tierIndex + 1, tiers.length - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setTierIndex(Math.max(tierIndex - 1, 0));
    }
  }

  const step = (n: number) => <span className="n num">{n}</span>;
  let s = 0;

  return (
    <div className="buy">
      <div className="price-panel" aria-live="polite">
        <CropMarks />
        <div className="total">
          <strong className="num">{formatBRL(tier.price)}</strong>
          <span className="num">
            por {tier.qty} {tier.qty === 1 ? "unidade" : "unidades"}
          </span>
        </div>
        <div className="unit">
          {tier.qty > 1 && (
            <span className="num">
              <b>{formatBRL(unit)}</b> por unidade
            </span>
          )}
          {saving > 0 && <span className="save-tag num">−{saving}% por unidade</span>}
        </div>
        {product.productionDays && (
          <div className="ready">
            <Icon name="clock" size={18} />
            <span>
              <ProductionDate days={product.productionDays} />
            </span>
          </div>
        )}
      </div>

      {product.papers.length > 0 && (
        <div className="step" role="radiogroup" aria-labelledby="papel-label">
          <div className="step-head">
            <h2 id="papel-label">
              {step(++s)} {product.papers.length > 1 ? "Escolha o material ou cor" : "Material"}
            </h2>
            <small>{product.papers.length > 1 ? `${product.papers.length} opções` : "única opção"}</small>
          </div>
          <div className="options">
            {product.papers.map((p) => {
              const c = colorOf(p);
              return (
                <label className="option" key={p}>
                  <input
                    type="radio"
                    name="papel"
                    value={p}
                    checked={paper === p}
                    onChange={() => setPaper(p)}
                  />
                  {colored && c ? (
                    <span className="swatch-dot" style={{ background: c }} aria-hidden="true" />
                  ) : (
                    <span className="dot" aria-hidden="true" />
                  )}
                  {p}
                </label>
              );
            })}
          </div>
          {product.colors && <p className="note">Impressão: {product.colors}</p>}
        </div>
      )}

      <div className="step">
        <div className="step-head">
          <h2 id="qtd-label">
            {step(++s)} Quantidade
          </h2>
          <small>quanto mais, menor o preço por unidade</small>
        </div>
        <div
          className="density"
          role="radiogroup"
          aria-labelledby="qtd-label"
          style={{ ["--cols" as string]: tiers.length > 4 ? Math.min(4, Math.ceil(tiers.length / 2)) : tiers.length }}
          onKeyDown={onTierKey}
        >
          {tiers.map((t, i) => {
            const u = unitPrice(t);
            const selected = i === tierIndex;
            return (
              <button
                key={t.qty}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                className="tier"
                onClick={() => setTierIndex(i)}
                aria-label={`${t.qty} unidades, ${formatBRL(t.price)}, ${formatBRL(u)} por unidade`}
              >
                {i === bestIndex && tiers.length > 2 && <span className="best">menor/un</span>}
                <span className="ink" aria-hidden="true">
                  <b style={{ ["--h" as string]: Math.max(0.08, u / maxUnit) }} />
                </span>
                <span className="q num">
                  {t.qty.toLocaleString("pt-BR")}
                  <small>un</small>
                </span>
                <span className="t num">{formatBRL(t.price)}</span>
                <span className="u num">{formatBRL(u)}/un</span>
              </button>
            );
          })}
        </div>
        <div className="density-legend" aria-hidden="true">
          <span>A barra mostra o preço por unidade em cada faixa</span>
          <span className="num">
            {tiers.length} {tiers.length === 1 ? "faixa" : "faixas"}
          </span>
        </div>
        <p className="other-qty">
          Precisa de outra quantidade?{" "}
          <a href={SITE_WHATSAPP} target="_blank" rel="noreferrer">
            Peça um orçamento no WhatsApp
          </a>
        </p>
      </div>

      {product.finishes.length > 0 && (
        <div className="step" role="group" aria-labelledby="acab-label">
          <div className="step-head">
            <h2 id="acab-label">
              {step(++s)} Acabamentos e serviços
            </h2>
            <small>opcional</small>
          </div>
          <div className="options">
            {product.finishes.map((f) => (
              <label className="option box" key={f}>
                <input
                  type="checkbox"
                  checked={finishes.includes(f)}
                  onChange={(e) =>
                    setFinishes((cur) => (e.target.checked ? [...cur, f] : cur.filter((x) => x !== f)))
                  }
                />
                <span className="dot" aria-hidden="true" />
                {f}
              </label>
            ))}
          </div>
          <p className="note">
            <Icon name="info" size={16} />
            O valor de acabamentos e serviços extras é confirmado pela equipe no orçamento, antes da produção.
          </p>
        </div>
      )}

      <div className="buy-actions" ref={cta}>
        <button className="btn btn-primary btn-lg" onClick={addToCart}>
          <Icon name={added ? "check" : "cart"} />
          {added ? "Adicionado" : "Adicionar ao carrinho"}
          <span className="price-inline num">· {formatBRL(tier.price)}</span>
        </button>
        <a className="btn btn-whats btn-lg" href={SITE_WHATSAPP} target="_blank" rel="noreferrer" aria-label="Tirar dúvidas no WhatsApp">
          <WhatsappIcon size={22} />
        </a>
      </div>

      <div className="assure">
        <div>
          <strong>
            <Icon name="file" size={16} /> Arte
          </strong>
          Envie seu arquivo pronto ou peça a criação da arte.
        </div>
        <div>
          <strong>
            <Icon name="store" size={16} /> Retirada
          </strong>
          Retire numa das 18 lojas ou receba em casa.
        </div>
        <div>
          <strong>
            <Icon name="register" size={16} /> Qualidade
          </strong>
          Impressão offset e digital do Grupo Impresul.
        </div>
      </div>

      <div className={`sticky-buy${showSticky ? " show" : ""}`} aria-hidden={!showSticky}>
        <div className="sb-price">
          <strong className="num">{formatBRL(tier.price)}</strong>
          <span className="num">
            {tier.qty} un · {formatBRL(unit)}/un
          </span>
        </div>
        <button className="btn btn-primary" onClick={addToCart} tabIndex={showSticky ? 0 : -1}>
          <Icon name={added ? "check" : "cart"} /> {added ? "Adicionado" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

export function PriceTable({ product }: { product: Product }) {
  const { tierIndex, setTierIndex } = useTier();
  const first = unitPrice(product.tiers[0]);
  return (
    <div className="ticket">
      <CropMarks />
      <div className="ticket-head">
        <h2>Tabela de preços</h2>
        <Swatches />
      </div>
      <table className="spec-table price-table">
        <thead>
          <tr>
            <th scope="col">Quantidade</th>
            <th scope="col">Total</th>
            <th scope="col">Por unidade</th>
            <th scope="col">Economia</th>
          </tr>
        </thead>
        <tbody>
          {product.tiers.map((t, i) => {
            const u = unitPrice(t);
            const save = Math.round((1 - u / first) * 100);
            return (
              <tr
                key={t.qty}
                className={i === tierIndex ? "on" : ""}
                onClick={() => setTierIndex(i)}
                style={{ cursor: "pointer" }}
              >
                <td className="num">{t.qty.toLocaleString("pt-BR")} un</td>
                <td className="num">{formatBRL(t.price)}</td>
                <td className="num">{formatBRL(u)}</td>
                <td className="num">{save > 0 ? `−${save}%` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Icon, WhatsappIcon } from "./Icon";
import { stores, telHref, whatsapp, type Store } from "@/lib/stores";

const regions: Store["region"][] = ["Porto Alegre", "Região Metropolitana", "Curitiba"];

export function StoresSection({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const [region, setRegion] = useState<Store["region"]>("Porto Alegre");
  const list = stores.filter((s) => s.region === region);
  const H = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="flood flood-cyan stores" aria-labelledby="lojas-title">
      <div className="wrap">
        <div className="stores-head">
          <div>
            <H className="display" id="lojas-title">
              {stores.length} lojas perto de você
            </H>
            <p className="lede">
              Retire na loja mais próxima ou fale com a equipe da sua região. Porto Alegre, região metropolitana e
              Curitiba.
            </p>
          </div>
          <div className="region-tabs" role="tablist" aria-label="Região">
            {regions.map((r) => (
              <button
                key={r}
                role="tab"
                id={`tab-${r}`}
                aria-selected={region === r}
                aria-controls="lojas-panel"
                onClick={() => setRegion(r)}
              >
                {r} <span className="num">({stores.filter((s) => s.region === r).length})</span>
              </button>
            ))}
          </div>
        </div>
        <div className="store-grid" role="tabpanel" id="lojas-panel" aria-labelledby={`tab-${region}`}>
          {list.map((s, i) => (
            <article className="store" key={s.email} style={{ animationDelay: `${i * 35}ms` }}>
              <h3>{s.name}</h3>
              <p>
                <Icon name="pin" size={16} /> {s.address}
              </p>
              <a href={telHref(s.phone)}>
                <Icon name="phone" size={16} /> <span className="num">{s.phone}</span>
              </a>
              <a href={`mailto:${s.email}`}>
                <Icon name="mail" size={16} /> {s.email}
              </a>
            </article>
          ))}
        </div>
        <div className="whats-strip">
          {whatsapp.map((w) => (
            <a key={w.label} href={w.href} target="_blank" rel="noreferrer">
              <small>{w.label}</small>
              <strong className="num">
                <WhatsappIcon size={18} /> {w.display}
              </strong>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

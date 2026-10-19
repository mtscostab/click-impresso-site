"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Icon, WhatsappIcon } from "../Icon";
import { normalize } from "@/lib/format";
import { stores, telHref, whatsapp, type Store } from "@/lib/stores";
import type { StoreMapHandle } from "./StoreMap";
import { VIEWS } from "./views";

const StoreMap = dynamic(() => import("./StoreMap").then((m) => m.StoreMap), { ssr: false });

const REGIONS = ["Todas", "Porto Alegre", "Região Metropolitana", "Curitiba"] as const;

export function WherePage() {
  const map = useRef<StoreMapHandle>(null);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Todas");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>();

  const list = useMemo(() => {
    const term = normalize(q.trim());
    return stores.filter(
      (s) =>
        (region === "Todas" || s.region === region) &&
        (!term || normalize(`${s.name} ${s.address}`).includes(term)),
    );
  }, [region, q]);

  function choose(r: (typeof REGIONS)[number]) {
    setRegion(r);
    setActive(undefined);
    map.current?.fly(r === "Todas" ? VIEWS.sul : VIEWS[r], 2200);
  }

  function pick(s: Store) {
    setActive(s.email);
    map.current?.focus(s);
    document.getElementById(`loja-${s.email}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div className="wrap">
      <header className="page-hero" style={{ paddingBottom: 20 }}>
        <h1 className="display">Onde estamos</h1>
        <p className="lede">
          {stores.length} lojas para retirar o seu pedido, mais o parque gráfico na Av. Protásio Alves, em Porto Alegre.
          Arraste o mapa, incline com dois dedos ou clique numa loja.
        </p>
      </header>
      <div className="where">
        <div className="where-list">
          <div className="map-card">
            <label className="filter-input" style={{ background: "#fff" }}>
              <Icon name="search" />
              <span className="visually-hidden">Buscar loja por nome ou endereço</span>
              <input type="search" placeholder="Bairro, rua ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div className="map-steps" role="group" aria-label="Região">
              {REGIONS.map((r) => (
                <button key={r} aria-pressed={r === region} className={r === region ? "on" : ""} onClick={() => choose(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="where-scroll" data-lenis-prevent>
            {list.length === 0 && <p className="lede">Nenhuma loja com “{q}”.</p>}
            {list.map((s) => (
              <article
                key={s.email}
                id={`loja-${s.email}`}
                className={`store-card${active === s.email ? " on" : ""}`}
                onClick={() => pick(s)}
              >
                <h3><button className="store-focus" type="button" aria-pressed={active === s.email} onClick={(e) => { e.stopPropagation(); pick(s); }}>{s.name}</button></h3>
                <p>
                  <Icon name="pin" size={16} /> {s.address}
                </p>
                <div className="acts">
                  <a href={telHref(s.phone)} onClick={(e) => e.stopPropagation()}>
                    <span className="num">{s.phone}</span>
                  </a>
                  <a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()}>
                    E-mail
                  </a>
                  {s.coords && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Como chegar ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
            <div className="map-card" style={{ display: "grid", gap: 8 }}>
              <strong>WhatsApp por região</strong>
              {whatsapp.map((w) => (
                <a key={w.label} href={w.href} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "center", textDecoration: "none" }}>
                  <WhatsappIcon size={16} /> {w.label} · <span className="num">{w.display}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="where-map">
          <StoreMap handle={map} interactive active={active} onSelect={pick} />
        </div>
      </div>
    </div>
  );
}

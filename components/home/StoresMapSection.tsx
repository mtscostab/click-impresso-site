"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../Icon";
import { stores, type Store } from "@/lib/stores";
import type { StoreMapHandle } from "../map/StoreMap";
import { VIEWS } from "../map/views";

gsap.registerPlugin(ScrollTrigger);

const StoreMap = dynamic(() => import("../map/StoreMap").then((m) => m.StoreMap), { ssr: false });

const STEPS = ["sul", "Porto Alegre", "Região Metropolitana", "Curitiba"] as const;
const LABEL: Record<(typeof STEPS)[number], string> = {
  sul: "Visão geral",
  "Porto Alegre": "Porto Alegre",
  "Região Metropolitana": "Região metropolitana",
  Curitiba: "Curitiba",
};

export function StoresMapSection() {
  const root = useRef<HTMLElement>(null);
  const map = useRef<StoreMapHandle>(null);
  const trig = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<string>();
  const stepRef = useRef(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      trig.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * 3,
        pin: true,
        onUpdate: (s) => {
          const i = Math.min(STEPS.length - 1, Math.floor(s.progress * STEPS.length));
          if (i !== stepRef.current) {
            stepRef.current = i;
            setStep(i);
            setActive(undefined);
            map.current?.fly(VIEWS[STEPS[i]]);
          }
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const region = STEPS[step];
  const list = region === "sul" ? stores : stores.filter((s) => s.region === region);

  function goStep(i: number) {
    const t = trig.current;
    if (!t) return;
    const target = t.start + ((t.end - t.start) * (i + 0.5)) / STEPS.length;
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  function pick(s: Store) {
    setActive(s.email);
    map.current?.focus(s);
  }

  return (
    <section className="mapsec" id="lojas" ref={root} aria-labelledby="map-title">
      <StoreMap handle={map} interactive={false} active={active} onSelect={pick} />
      <div className="map-ui">
        <div className="map-card">
          <h2 className="display" id="map-title">
            {region === "sul" ? `${stores.length} lojas perto de você` : LABEL[region]}
          </h2>
          <p className="lede">
            {region === "sul"
              ? "Parque gráfico em Porto Alegre e lojas no RS e em Curitiba. Role para percorrer o mapa."
              : `${list.length} ${list.length === 1 ? "loja" : "lojas"} nesta região. Toque numa loja para ver no mapa.`}
          </p>
          <div className="map-steps" role="tablist" aria-label="Região do mapa">
            {STEPS.map((s, i) => (
              <button key={s} role="tab" aria-selected={i === step} className={i === step ? "on" : ""} onClick={() => goStep(i)}>
                {LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="map-card map-list" data-lenis-prevent>
          {list.map((s) => (
            <button key={s.email} className={active === s.email ? "on" : ""} onClick={() => pick(s)}>
              <strong>{s.name}</strong>
              <span>{s.address}</span>
            </button>
          ))}
        </div>
        <Link href="/onde-estamos" className="btn btn-primary" style={{ alignSelf: "start" }}>
          Ver endereços e telefones <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </section>
  );
}

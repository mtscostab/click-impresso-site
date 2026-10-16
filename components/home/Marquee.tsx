"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const rowA = ["Cartões de visita", "Flyers", "Folders", "Banners", "Crachás", "Adesivos", "Rótulos", "Cardápios"];
const rowB = ["Canecas", "Squeezes", "Camisetas", "Cadernos", "Kits corporativos", "Sacolas", "Fachadas", "Brindes"];
const colors = ["var(--cyan)", "var(--magenta)", "var(--yellow)", "#fff"];

function Row({ words, outline }: { words: string[]; outline?: boolean }) {
  const items = [...words, ...words, ...words];
  return (
    <div className={`marquee-row${outline ? " outline" : ""}`}>
      {items.map((w, i) => (
        <span key={i}>
          {w}
          <b style={{ background: colors[i % 4] }} />
        </span>
      ))}
    </div>
  );
}

/** Faixa de produtos que corre sozinha e acelera com a velocidade do scroll. */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".marquee-row");
      const tweens = rows.map((r, i) =>
        gsap.fromTo(
          r,
          { xPercent: i % 2 ? -33.333 : 0 },
          { xPercent: i % 2 ? 0 : -33.333, duration: 38, ease: "none", repeat: -1 },
        ),
      );
      let boost = 1;
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => (boost = Math.min(6, 1 + Math.abs(s.getVelocity()) / 250)),
      });
      const tick = () => {
        boost += (1 - boost) * 0.05;
        tweens.forEach((t) => t.timeScale(boost));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <Row words={rowA} />
      <Row words={rowB} outline />
    </div>
  );
}

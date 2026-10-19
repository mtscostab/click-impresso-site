"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../Icon";
import { formatBRL } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

export type Pick = { cat: string; id: string; title: string; img: string; price: number; qty: number };

export function Showcase({ picks }: { picks: Pick[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 32);
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
        },
      });
      // paralaxe dentro de cada foto, relativa ao movimento horizontal
      gsap.utils.toArray<HTMLElement>(".pcard .ph img").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: 5 },
          {
            xPercent: -5,
            ease: "none",
            scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section className="showcase" ref={root} aria-labelledby="show-title">
      <span className="glow glow-m" style={{ width: 520, height: 520, left: -120, top: -160 }} />
      <span className="glow glow-c" style={{ width: 460, height: 460, right: -100, bottom: -180 }} />
      <div className="showcase-inner">
        <div className="wrap showcase-head">
          <h2 className="display" id="show-title">
            O que a gente imprime para você
          </h2>
          <p className="lede">Preço por quantidade e prazo de produção em cada produto. Role para explorar os produtos.</p>
        </div>
        <div className="track" ref={track}>
          {picks.map((p) => (
            <Link key={p.id} className="pcard" href={`/produto/${p.id}`} onFocus={(e) => {
              const pin = ScrollTrigger.getAll().find((t) => t.trigger === root.current);
              if (!pin || !track.current) return;
              const distance = track.current.scrollWidth - window.innerWidth + 32;
              const x = Math.max(0, Math.min(distance, e.currentTarget.offsetLeft - 32));
              window.__lenis?.scrollTo(pin.start + x, { immediate: true });
              if (!window.__lenis) window.scrollTo(0, pin.start + x);
            }}>
              <span className="go" aria-hidden="true">
                <Icon name="arrowRight" size={18} />
              </span>
              <div className="ph">
                <img src={p.img} alt="" loading="lazy" />
              </div>
              <div className="meta">
                <span className="pc-cat">{p.cat}</span>
                <h3>{p.title}</h3>
                <span className="num">
                  a partir de <strong>{formatBRL(p.price)}</strong> · {p.qty} un
                </span>
              </div>
            </Link>
          ))}
          <Link className="pcard end" href="/produtos">
            <h3>Ver todos os produtos</h3>
            <span className="btn btn-glass" style={{ alignSelf: "start" }}>
              Ir para a loja <Icon name="arrowRight" size={16} />
            </span>
          </Link>
          <div style={{ width: "var(--gutter)", flexShrink: 0 }} />
        </div>
        <div className="showcase-bar">
          <i ref={bar} />
        </div>
      </div>
    </section>
  );
}

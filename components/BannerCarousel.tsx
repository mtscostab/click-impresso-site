"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CropMarks } from "./Marks";
import { Icon } from "./Icon";

export type Banner = { src: string; srcMobile: string; alt: string; href: string };

const AUTOPLAY_MS = 6000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"from-left" | "from-right">("from-left");
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const swiped = useRef(false);
  const n = banners.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  const go = useCallback(
    (to: number, d?: "from-left" | "from-right") => {
      setIndex((cur) => {
        const next = (to + n) % n;
        if (next === cur) return cur;
        setPrev(cur);
        setDir(d ?? (next > cur ? "from-left" : "from-right"));
        return next;
      });
    },
    [n],
  );

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => go(index + 1, "from-left"), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduced, go]);

  return (
    <section
      className={`carousel${paused ? " is-paused" : ""}`}
      aria-roledescription="carrossel"
      aria-label="Destaques da Click Impresso"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ ["--autoplay" as string]: `${AUTOPLAY_MS}ms` }}
    >
      <div className="carousel-frame">
      <CropMarks />
      <div
        className="carousel-stage"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          swiped.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, id: e.pointerId };
        }}
        onPointerUp={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          drag.current = null;
          if (Math.abs(dx) > 40) {
            swiped.current = true;
            e.preventDefault();
            if (dx < 0) go(index + 1, "from-left");
            else go(index - 1, "from-right");
          }
        }}
        onPointerCancel={() => { drag.current = null; swiped.current = false; }}
        onLostPointerCapture={() => { drag.current = null; }}
        onClickCapture={(e) => {
          if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; }
          else if (e.target === e.currentTarget) e.currentTarget.querySelector<HTMLAnchorElement>(".is-active a")?.click();
        }}
      >
        {banners.map((b, i) => {
          const state = i === index ? `is-active ${dir}` : i === prev ? "is-prev" : "";
          return (
            <div
              key={b.src}
              className={`carousel-slide ${state}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${n}: ${b.alt}`}
              aria-hidden={i !== index}
            >
              <Link href={b.href} tabIndex={i === index ? 0 : -1} draggable={false}>
                <picture>
                  <source media="(max-width: 767px)" srcSet={b.srcMobile} />
                  <img
                  src={b.src}
                  alt={b.alt}
                  width={1500}
                  height={350}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  draggable={false}
                />
                </picture>
              </Link>
            </div>
          );
        })}
      </div>
      </div>
      <div className="carousel-bar">
        <div className="carousel-dots" role="group" aria-label="Escolher destaque">
          {banners.map((b, i) => (
            <button
              key={b.src}
              className="carousel-dot"
              aria-label={`Ver destaque ${i + 1}: ${b.alt}`}
              aria-current={i === index}
              onClick={() => go(i)}
            >
              <span className="fill" key={i === index ? `on-${index}` : "off"} />
            </button>
          ))}
        </div>
        <div className="carousel-nav">
          <span className="counter num" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button className="square-btn" aria-label="Destaque anterior" onClick={() => go(index - 1, "from-right")}>
            <Icon name="arrowLeft" />
          </button>
          <button className="square-btn" aria-label="Próximo destaque" onClick={() => go(index + 1, "from-left")}>
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </section>
  );
}

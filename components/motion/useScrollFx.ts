"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Efeitos declarativos dentro de um container:
 *  [data-reveal]        entra de baixo com desfoque
 *  [data-split]         título dividido em palavras, entra em cascata
 *  [data-speed="0.2"]   paralaxe vertical proporcional ao scroll
 *  [data-count="56"]    contador que sobe ao entrar na tela
 */
export function useScrollFx(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        if (!el.dataset.splitDone) {
          const words = el.textContent?.trim().split(/\s+/) ?? [];
          el.innerHTML = words
            .map((w) => `<span class="w"><span class="wi">${w}</span></span>`)
            .join(" ");
          el.dataset.splitDone = "1";
        }
        if (reduce) return;
        gsap.from(el.querySelectorAll(".wi"), {
          yPercent: 110,
          rotate: 4,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      if (!reduce) {
        root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 48,
            autoAlpha: 0,
            filter: "blur(8px)",
            duration: 1.1,
            ease: "expo.out",
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        root.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = Number(el.dataset.speed);
          gsap.fromTo(
            el,
            { yPercent: speed * 50 },
            {
              yPercent: -speed * 50,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      }

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: reduce ? end : 0 };
        const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
        el.textContent = fmt(obj.v);
        if (reduce) return;
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => (el.textContent = fmt(obj.v)),
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [scope]);
}

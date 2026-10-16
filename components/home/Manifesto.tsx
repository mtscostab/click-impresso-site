"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollFx } from "../motion/useScrollFx";

gsap.registerPlugin(ScrollTrigger);

const TEXT =
  "A Click Impresso faz parte do Grupo Impresul, referência no setor gráfico há mais de 56 anos e reconhecida como a gráfica mais premiada do Sul do Brasil.";
const HIGHLIGHT = new Set(["Grupo", "Impresul,", "56", "premiada"]);

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".mw");
      ScrollTrigger.create({
        trigger: ".big",
        start: "top 80%",
        end: "bottom 45%",
        scrub: true,
        onUpdate: (s) => {
          const n = Math.round(s.progress * words.length);
          words.forEach((w, i) => w.classList.toggle("on", i < n));
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="manifesto" id="empresa" ref={root} aria-label="A empresa">
      <div className="wrap">
        <p className="big">
          {TEXT.split(" ").map((w, i) => (
            <span key={i} className={`mw${HIGHLIGHT.has(w) ? " hl" : ""}`}>
              {w}{" "}
            </span>
          ))}
        </p>
        <div className="collage">
          <figure className="c1">
            <img data-speed="0.25" src="/img/produtos/caderneta-moleskine-capa-corino-com-presilha-para-caneta-esc-2.jpg" alt="Cadernetas personalizadas com o logo Click sobre uma mesa" />
          </figure>
          <figure className="c2">
            <img data-speed="0.35" src="/img/produtos/caderno-inteligente-escolha-sua-cor-2.jpg" alt="Pessoa segurando um caderno inteligente rosa aberto" />
          </figure>
          <figure className="c3">
            <img data-speed="0.2" src="/img/produtos/camiseta-camisa-dry-fit-promocional-p-m-g-e-gg-escolha-sua-c-2.jpg" alt="Camiseta branca com o logo Click" />
          </figure>
          <div className="stat-card s1" data-reveal>
            <strong className="num" data-count="56">56</strong>
            <span>anos de experiência do Grupo Impresul no setor gráfico</span>
          </div>
          <div className="stat-card s2" data-reveal data-delay="0.08">
            <strong className="num">
              <span className="nowrap"><span data-count="10">10</span> mil m²</span>
            </strong>
            <span>de parque gráfico na Av. Protásio Alves, 6441</span>
          </div>
          <div className="stat-card s3" data-reveal data-delay="0.16">
            <strong className="num" data-count="18">18</strong>
            <span>lojas em Porto Alegre, região metropolitana e Curitiba</span>
          </div>
          <div className="stat-card s4" data-reveal data-delay="0.24">
            <strong className="num">
              +<span data-count="5000">5.000</span>
            </strong>
            <span>produtos para imprimir e personalizar</span>
          </div>
        </div>
      </div>
    </section>
  );
}

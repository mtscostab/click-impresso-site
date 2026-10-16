"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon, WhatsappIcon } from "../Icon";
import { useScrollFx } from "../motion/useScrollFx";
import { formatBRL, unitPrice, type Tier } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

export function Differentials({ tiers }: { tiers: Tier[] }) {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root);
  const max = Math.max(...tiers.map(unitPrice));

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from(".tile", {
          y: 60,
          rotateX: -12,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ".bento", start: "top 82%" },
        });
        gsap.from(".bars i", {
          scaleY: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ".bars", start: "top 85%" },
        });
      }
      // inclinação 3D e luz que segue o ponteiro
      el.querySelectorAll<HTMLElement>(".tile").forEach((t) => {
        const move = (e: PointerEvent) => {
          const r = t.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          t.style.setProperty("--mx", `${x * 100}%`);
          t.style.setProperty("--my", `${y * 100}%`);
          if (!reduce) gsap.to(t, { rotateY: (x - 0.5) * 8, rotateX: -(y - 0.5) * 8, duration: 0.6, ease: "power3.out" });
        };
        const leave = () => gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" });
        t.addEventListener("pointermove", move);
        t.addEventListener("pointerleave", leave);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bento-sec" ref={root} aria-labelledby="dif-title">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="display" id="dif-title" data-split>
            Por que imprimir na Click
          </h2>
          <p className="lede" data-reveal>
            Estrutura de grande gráfica com atendimento de loja de bairro: você escolhe, acompanha o preço e retira perto
            de casa.
          </p>
        </div>
        <div className="bento">
          <article className="tile dark t-a">
            <div>
              <span className="tile-ico">
                <Icon name="sliders" />
              </span>
            </div>
            <div>
              <h3>Quanto mais você imprime, menor o preço por unidade</h3>
              <p>
                Todo produto mostra a tabela por faixa de quantidade antes do pedido. No crachá em PVC, por exemplo:
              </p>
            </div>
            <div className="bars" aria-label="Preço por unidade do crachá em PVC por faixa de quantidade">
              {tiers.map((t) => (
                <div key={t.qty}>
                  <small className="num">{formatBRL(unitPrice(t)).replace("R$", "").trim()}</small>
                  <i style={{ height: `${(unitPrice(t) / max) * 100}%` }} />
                  <small className="num">{t.qty} un</small>
                </div>
              ))}
            </div>
          </article>
          <article className="tile t-b">
            <span className="tile-ico">
              <Icon name="register" />
            </span>
            <div>
              <span className="big num nowrap">10 mil m²</span>
              <h3 style={{ marginTop: 10 }}>Parque gráfico próprio</h3>
              <p>Offset, digital e acabamento sob o mesmo teto, na Av. Protásio Alves, em Porto Alegre.</p>
            </div>
          </article>
          <article className="tile mag t-c">
            <span className="tile-ico" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Icon name="store" />
            </span>
            <div>
              <span className="big num">18</span>
              <h3>lojas para retirar</h3>
              <p>Porto Alegre, região metropolitana e Curitiba.</p>
            </div>
          </article>
          <article className="tile t-d">
            <span className="tile-ico">
              <Icon name="file" />
            </span>
            <div>
              <h3>Arte pronta ou criação</h3>
              <p>Envie o arquivo ou peça a criação da arte.</p>
            </div>
          </article>
          <article className="tile t-e">
            <span className="tile-ico">
              <Icon name="truck" />
            </span>
            <div>
              <h3>Entrega para todo o Brasil</h3>
              <p>Receba em qualquer lugar com a agilidade de uma gráfica expressa.</p>
            </div>
            <span className="orbit" aria-hidden="true" />
          </article>
          <article className="tile t-f">
            <span className="tile-ico">
              <Icon name="cart" />
            </span>
            <div>
              <h3>Click Atacado</h3>
              <p>Brindes personalizados com a sua marca. Quanto mais peças, menor o preço.</p>
            </div>
          </article>
          <article className="tile dark t-g">
            <span className="tile-ico">
              <WhatsappIcon />
            </span>
            <div>
              <h3>Atendimento por região</h3>
              <p>Fale direto com a equipe de Porto Alegre, Curitiba ou do atacado pelo WhatsApp.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

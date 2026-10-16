"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon, WhatsappIcon } from "../Icon";
import { ContactForm } from "../ContactForm";
import { useScrollFx } from "../motion/useScrollFx";
import { whatsapp } from "@/lib/stores";

export function Closing() {
  const root = useRef<HTMLElement>(null);
  useScrollFx(root);
  return (
    <section className="closing" id="contato" ref={root} aria-labelledby="close-title">
      <div className="wrap">
        <div className="closing-card" data-reveal>
          <span className="glow glow-m" style={{ width: 460, height: 460, left: -140, bottom: -200 }} />
          <span className="glow glow-c" style={{ width: 380, height: 380, left: "30%", top: -220 }} />
          <div>
            <h2 className="display" id="close-title">
              Vamos imprimir o seu próximo projeto?
            </h2>
            <p className="lede">
              Escolha o produto na loja, veja o preço na hora e retire perto de você. Ou mande uma mensagem que a equipe
              responde.
            </p>
            <div className="h-actions">
              <Link href="/produtos" className="btn btn-primary btn-lg">
                Começar meu pedido
                <span className="arrow">
                  <Icon name="arrowRight" size={16} />
                </span>
              </Link>
              <Link href="/onde-estamos" className="btn btn-ghost btn-lg">
                Onde estamos
              </Link>
            </div>
            <div className="closing-lines">
              <a href="tel:+555133810978">
                <Icon name="phone" size={18} /> <span className="num">51 3381 0978</span>
              </a>
              <a href="mailto:atendimento@clickimpresso.com.br">
                <Icon name="mail" size={18} /> atendimento@clickimpresso.com.br
              </a>
              {whatsapp.slice(0, 2).map((w) => (
                <a key={w.label} href={w.href} target="_blank" rel="noreferrer">
                  <WhatsappIcon size={18} /> {w.label} <span className="num">{w.display}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="form-card">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "../Icon";
import { useScrollFx } from "../motion/useScrollFx";

// Respostas montadas só com o que o site atual informa
const QA = [
  {
    q: "Qual é o prazo de produção?",
    a: "Cada produto mostra o prazo em dias úteis na própria página, antes do pedido. O prazo varia conforme o produto e começa a contar depois da aprovação da arte.",
  },
  {
    q: "Posso enviar a minha arte pronta?",
    a: "Sim. Você pode enviar o arquivo finalizado, escolher um modelo pronto ou contratar a criação da arte, que aparece como opção de acabamento nos produtos.",
  },
  {
    q: "Como funciona o preço por quantidade?",
    a: "Todo produto tem uma tabela de faixas. Quanto maior a quantidade, menor o preço por unidade. A página do produto mostra o total e o valor por unidade de cada faixa.",
  },
  {
    q: "Posso retirar o pedido numa loja?",
    a: "Sim. São 18 lojas em Porto Alegre, região metropolitana e Curitiba. Também entregamos em qualquer lugar do Brasil.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "Cartões Visa, Mastercard, Elo, American Express, Discover, Diners, Hipercard e JCB, além de boleto.",
  },
  {
    q: "Vocês fazem brindes em grande quantidade?",
    a: "Sim, pelo Click Atacado: brindes personalizados com a sua marca, com preço menor conforme o número de peças.",
  },
];

export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);
  useScrollFx(root);
  return (
    <section className="faq" id="faq" ref={root} aria-labelledby="faq-title">
      <div className="wrap">
        <div className="faq-side">
          <h2 className="display" id="faq-title" data-split>
            Perguntas frequentes
          </h2>
          <p className="lede" data-reveal>
            Não achou a resposta? Fale com a equipe da sua região.
          </p>
          <div data-reveal>
            <Link href="#contato" className="btn btn-ghost">
              Falar com a Click <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
        <div className="faq-list">
          {QA.map((item, i) => {
            const on = open === i;
            return (
              <div key={item.q} className={`faq-item${on ? " on" : ""}`} data-reveal data-delay={String(i * 0.05)}>
                <h3 className="faq-q">
                  <button
                    id={`faq-b${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                  >
                    {item.q}
                    <span className="pm" aria-hidden="true">
                      <Icon name="plus" size={18} />
                    </span>
                  </button>
                </h3>
                <div className="ans-wrap" id={`faq-a${i}`} role="region" aria-labelledby={`faq-b${i}`} inert={!on}>
                  <div className="ans">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Component, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PressScene = dynamic(() => import("../three/PressScene"), {
  ssr: false,
  loading: () => <div className="map-fallback">Preparando a máquina…</div>,
});

class PressFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <img className="process-poster" src="/video/offset-hero-poster.jpg" alt="" />
      : this.props.children;
  }
}

const STEPS = [
  {
    id: "pre",
    tag: "Pré-impressão",
    short: "Pré",
    color: "var(--cyan)",
    title: "Sua arte vira quatro chapas",
    text: "Conferimos o arquivo e separamos a imagem nas quatro cores de processo: ciano, magenta, amarelo e preto. Cada cor ganha a sua própria chapa.",
    from: 0,
    to: 0.22,
  },
  {
    id: "offset",
    tag: "Offset Heidelberg",
    short: "Offset",
    color: "var(--magenta)",
    title: "Quatro cores numa só passada",
    text: "Nas impressoras offset Heidelberg a folha atravessa quatro grupos de impressão em sequência. Cada grupo deposita uma cor, alinhada no registro, com a mesma qualidade do primeiro ao último exemplar.",
    from: 0.22,
    to: 0.58,
  },
  {
    id: "acabamento",
    tag: "Acabamento",
    short: "Acabam.",
    color: "#e2d000",
    title: "Corte, dobra e acabamento",
    text: "As folhas impressas seguem para o refile na guilhotina, dobras e demais acabamentos, até virarem cartões, folders e flyers prontos para entregar.",
    from: 0.58,
    to: 0.76,
  },
  {
    id: "digital",
    tag: "Digital Konica Minolta",
    short: "Digital",
    color: "var(--ink)",
    title: "Digital para tiragens curtas",
    text: "Para poucas unidades, personalização e prazos curtos, a produção digital Konica Minolta imprime direto do arquivo, sem chapa.",
    from: 0.76,
    to: 1.0001,
  },
];

export function Process() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    if (reduce) return;
    const ctx = gsap.context(() => {
      trigger.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * 5,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (s) => {
          const p = s.progress;
          progress.current = p;
          const i = STEPS.findIndex((st) => p >= st.from && p < st.to);
          setStep((cur) => (i >= 0 && i !== cur ? i : cur));
          STEPS.forEach((st, j) => {
            const fill = Math.min(1, Math.max(0, (p - st.from) / (st.to - st.from)));
            bars.current[j]?.style.setProperty("--fill", String(fill));
          });
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  function jump(i: number) {
    const t = trigger.current;
    if (!t) {
      progress.current = STEPS[i].from + 0.02;
      setStep(i);
      return;
    }
    const target = t.start + (t.end - t.start) * (STEPS[i].from + 0.02);
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section className="process" id="processos" ref={root} aria-labelledby="proc-title">
      <div className="process-canvas" aria-hidden="true">
        {reduced === false && <PressFallback><PressScene progress={progress} /></PressFallback>}
      </div>
      <div className="process-ui">
        <div className="process-head">
          <h2 className="display" id="proc-title">
            Como a sua impressão é feita
          </h2>
          <div className="process-legend" aria-hidden="true">
            <span>
              <b className="swatch-c" /> Ciano
            </span>
            <span>
              <b className="swatch-m" /> Magenta
            </span>
            <span>
              <b className="swatch-y" /> Amarelo
            </span>
            <span>
              <b className="swatch-k" /> Preto
            </span>
          </div>
        </div>
        <div className="process-spacer" />
        <div className="process-bottom">
          <div className="process-panel" aria-live="polite">
            {STEPS.map((s, i) => (
              <article key={s.id} className={`process-step${i === step ? " on" : ""}`} aria-hidden={i !== step}>
                <span className="tag">
                  <b style={{ background: s.color }} />
                  {String(i + 1).padStart(2, "0")} · {s.tag}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <nav className="process-progress" aria-label="Etapas da produção">
            {STEPS.map((s, i) => (
              <button key={s.id} className={i === step ? "on" : ""} aria-label={s.tag} aria-pressed={i === step} onClick={() => jump(i)}>
                <i ref={(el) => void (bars.current[i] = el)} style={{ ["--bar" as string]: s.color }} />
                <span className="full">{s.tag}</span>
                <span className="short" aria-hidden="true">{s.short}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

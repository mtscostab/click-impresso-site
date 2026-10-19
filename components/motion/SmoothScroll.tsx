"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const HEADER_OFFSET = -84;

/** Rola até um elemento depois que os pins do GSAP terminaram de medir a página. */
export function scrollToHash(hash: string, immediate = false) {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, "")); } catch { return false; }
  const el = hash ? document.getElementById(id) : null;
  if (!el) return false;
  immediate ||= window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  ScrollTrigger.refresh();
  const top = el.getBoundingClientRect().top + window.scrollY;
  // seções fixadas (pin) ficam dentro de um pin-spacer; o topo certo é o do spacer
  const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : null;
  const y = (spacer ? spacer.getBoundingClientRect().top + window.scrollY : top) + (spacer ? 0 : HEADER_OFFSET);
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate, duration: 1.3, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  return true;
}

const POS_KEY = "clickimpresso:scroll";
let poppedTo: string | null = null;
/** true do clique até a página nova montar: a rolagem desse intervalo é ruído da troca */
let navigating = false;

function routeKey() {
  return location.pathname + location.search;
}

function savePosition(key: string, y: number) {
  try {
    const all = savedPositions();
    all[key] = Math.round(y);
    sessionStorage.setItem(POS_KEY, JSON.stringify(all));
  } catch {}
}

function savedPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(POS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function SmoothScroll() {
  const pathname = usePathname();

  // Guarda a posição de cada página para o "voltar" do navegador devolver ao mesmo ponto.
  // A posição é gravada no clique, antes de a página atual desmontar: ao desmontar, as
  // seções fixadas somem, a página encolhe e a rolagem cai para um ponto errado.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      if (navigating) return;
      clearTimeout(t);
      const key = routeKey();
      t = setTimeout(() => {
        if (!navigating && key === routeKey()) savePosition(key, window.scrollY);
      }, 120);
    };
    const onLeave = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname + url.search === location.pathname + location.search) return;
      clearTimeout(t);
      savePosition(routeKey(), window.scrollY);
      navigating = true;
    };
    const onPop = () => {
      clearTimeout(t);
      navigating = true;
      poppedTo = routeKey();
    };
    window.addEventListener("scroll", save, { passive: true });
    document.addEventListener("click", onLeave, true);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("scroll", save);
      document.removeEventListener("click", onLeave, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Cliques em links para uma seção da página atual ("/#contato" estando na home, "#faq")
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      if (!url.hash) {
        if (url.pathname === document.querySelector<HTMLAnchorElement>(".brand")?.pathname && url.search === location.search) {
          e.preventDefault();
          history.pushState(null, "", url.pathname + url.search);
          scrollToHash("#conteudo");
        }
        return;
      }
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const destination = document.getElementById(id);
      if (!destination) return;
      e.preventDefault();
      history.pushState(null, "", url.pathname + url.search + url.hash);
      scrollToHash(url.hash);
      if (id === "conteudo") destination.focus({ preventScroll: true });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Troca de página: sempre começa do topo, ou vai direto para a seção do hash.
  // A inércia do scroll suave da página anterior é interrompida antes, senão ela
  // continua rolando e a página nova abre no meio.
  useEffect(() => {
    const hash = location.hash;
    const lenis = window.__lenis;
    const key = routeKey();
    if (poppedTo === key) {
      poppedTo = null;
      const y = savedPositions()[key] ?? 0;
      // A home só tem a altura certa depois que as seções fixadas (pins) e as cenas montam.
      // Reaplica a posição até a página comportar o ponto salvo e ele se manter estável.
      let stable = 0;
      let tries = 0;
      let stopped = false;
      const apply = () => {
        if (document.documentElement.scrollHeight < y + window.innerHeight) ScrollTrigger.refresh();
        lenis?.scrollTo(y, { immediate: true, force: true });
        window.scrollTo(0, y);
      };
      const loop = setInterval(() => {
        if (stopped) return;
        tries++;
        if (Math.abs(window.scrollY - y) < 2 && document.documentElement.scrollHeight >= y + window.innerHeight) stable++;
        else stable = 0;
        apply();
        if ((stable >= 6 && tries >= 8) || tries > 40) {
          clearInterval(loop);
          ScrollTrigger.refresh();
          apply();
          navigating = false;
        }
      }, 100);
      lenis?.stop();
      apply();
      lenis?.start();
      const cancel = () => {
        stopped = true;
        clearInterval(loop);
        navigating = false;
      };
      window.addEventListener("wheel", cancel, { once: true, passive: true });
      window.addEventListener("touchstart", cancel, { once: true, passive: true });
      return () => {
        clearInterval(loop);
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
      };
    }
    const release = setTimeout(() => (navigating = false), 1200);
    const toTop = () => {
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    lenis?.stop();
    toTop();
    lenis?.start();
    if (!hash) {
      const timers = [60, 200, 500].map((t) => setTimeout(toTop, t));
      const r = setTimeout(() => ScrollTrigger.refresh(), 350);
      // se a pessoa já começou a rolar, não puxa de volta
      const cancel = () => timers.forEach(clearTimeout);
      const opts = { once: true, passive: true } as const;
      window.addEventListener("wheel", cancel, opts);
      window.addEventListener("touchstart", cancel, opts);
      window.addEventListener("keydown", cancel, { once: true });
      return () => {
        cancel();
        clearTimeout(r);
        clearTimeout(release);
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
        window.removeEventListener("keydown", cancel);
      };
    }
    let followup: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (scrollToHash(hash, true) || tries > 20) {
        clearInterval(t);
        followup = setTimeout(() => scrollToHash(hash, true), 450);
      }
    }, 150);
    return () => { clearInterval(t); clearTimeout(followup); clearTimeout(release); };
  }, [pathname]);

  return null;
}

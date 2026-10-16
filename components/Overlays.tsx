"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, WhatsappIcon } from "./Icon";
import { useCart } from "@/lib/cart";
import { whatsapp } from "@/lib/stores";

export function Toast() {
  const { toast, dismissToast } = useCart();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="ok">
        <Icon name="check" size={16} />
      </span>
      <p>{toast.message}</p>
      {toast.action ? (
        <button
          className="act"
          onClick={() => {
            toast.action?.();
            dismissToast();
          }}
        >
          {toast.actionLabel}
        </button>
      ) : (
        <Link href="/carrinho" onClick={dismissToast}>
          Ver carrinho
        </Link>
      )}
      <button className="x" aria-label="Fechar aviso" onClick={dismissToast}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export function WhatsFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="whats-fab" ref={ref}>
      {open && (
        <div className="whats-pop" id="whats-pop">
          <header>
            <strong>Fale com a Click pelo WhatsApp</strong>
            <p>Escolha a região mais perto de você.</p>
          </header>
          <ul>
            {whatsapp.map((w) => (
              <li key={w.label}>
                <a href={w.href} target="_blank" rel="noreferrer">
                  {w.label} <span className="num">{w.display}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        aria-label={open ? "Fechar atendimento por WhatsApp" : "Atendimento por WhatsApp"}
        aria-expanded={open}
        aria-controls="whats-pop"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <Icon name="close" size={24} /> : <WhatsappIcon size={30} />}
      </button>
    </div>
  );
}

const COOKIE_KEY = "clickimpresso:cookies";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(COOKIE_KEY));
    } catch {}
  }, []);
  if (!show) return null;
  return (
    <div className="cookie" role="region" aria-label="Aviso de cookies">
      <p>
        O ClickImpresso usa cookies para aprimorar a sua experiência e navegação na loja. Ao usar nosso site, você
        concorda com a nossa{" "}
        <a href="https://www.clickimpresso.com.br/termo-de-uso" target="_blank" rel="noreferrer">
          Política de Uso, Cookies e Privacidade
        </a>
        .
      </p>
      <button
        className="btn"
        onClick={() => {
          try {
            localStorage.setItem(COOKIE_KEY, "yes");
          } catch {}
          setShow(false);
        }}
      >
        Aceitar cookies
      </button>
    </div>
  );
}

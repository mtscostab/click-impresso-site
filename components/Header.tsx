"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ColorBar } from "./Marks";
import { Icon } from "./Icon";
import { useCart } from "@/lib/cart";
import { formatBRL, normalize, shortTitle } from "@/lib/format";

export type NavCat = { slug: string; name: string; count: number };
type Hit = { id: string; t: string; c: string; p: number; i: string; s: string };

let indexPromise: Promise<Hit[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/search-index.json").then((r) => {
    if (!r.ok) throw new Error("Busca indisponível");
    return r.json();
  }).catch((error) => {
    indexPromise = null;
    throw error;
  });
  return indexPromise;
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const n = normalize(text);
  const i = n.indexOf(normalize(q));
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Search({ cats, onNavigate }: { cats: NavCat[]; onNavigate?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState<Hit[] | null>(null);
  useEffect(() => {
    loadIndex().then(setIndex).catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    const term = normalize(q.trim());
    if (!term) return { items: [] as Hit[], cats: [] as NavCat[] };
    const words = term.split(/\s+/);
    const items = (index ?? []).filter((p) => words.every((w) => p.s.includes(w))).slice(0, 6);
    const found = cats.filter((c) => normalize(c.name).includes(term)).slice(0, 4);
    return { items, cats: found };
  }, [q, index, cats]);

  const flat = [
    ...results.items.map((p) => `/produto/${p.id}`),
    ...results.cats.map((c) => `/categoria/${c.slug}`),
  ];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || !flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? flat.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(flat[active] ?? `/busca?q=${encodeURIComponent(q.trim())}`);
    }
  }

  const showPanel = open && q.trim().length > 0;

  return (
    <div className="search" ref={wrap} onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
    }}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go(`/busca?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <label htmlFor={inputId} className="visually-hidden">
          Pesquisar produtos no site
        </label>
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          placeholder="Pesquisar produtos no site"
          value={q}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-activedescendant={showPanel && active >= 0 && active < flat.length ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        <button type="submit" aria-label="Buscar">
          <Icon name="search" />
        </button>
      </form>
      {showPanel && (
        <div className="suggest" id={listId} role="listbox" aria-label="Sugestões">
          {results.items.length === 0 && results.cats.length === 0 && (
            <p className="empty">
              {index === null ? "Carregando sugestões…" : `Nenhuma sugestão para “${q}”. Pressione Enter para buscar no catálogo.`}
            </p>
          )}
          {results.items.length > 0 && (
            <>
              <h3 className="label">Produtos</h3>
              <ul>
                {results.items.map((p, i) => (
                  <li key={p.id}>
                    <a
                      href={`/produto/${p.id}`}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={active === i}
                      onClick={(e) => {
                        e.preventDefault();
                        go(`/produto/${p.id}`);
                      }}
                    >
                      <img src={p.i} alt="" width={48} height={48} />
                      <span className="t">
                        <Highlight text={shortTitle(p.t)} q={q.trim()} />
                      </span>
                      <span className="p num">{formatBRL(p.p)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {results.cats.length > 0 && (
            <>
              <h3 className="label">Categorias</h3>
              <ul>
                {results.cats.map((c, j) => (
                  <li key={c.slug}>
                    <a
                      className="cat"
                      href={`/categoria/${c.slug}`}
                      id={`${listId}-${results.items.length + j}`}
                      role="option"
                      aria-selected={active === results.items.length + j}
                      onClick={(e) => {
                        e.preventDefault();
                        go(`/categoria/${c.slug}`);
                      }}
                    >
                      <span className="t">
                        <Highlight text={c.name} q={q.trim()} />
                      </span>
                      <span className="p num">{c.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({ cats, segs }: { cats: NavCat[]; segs: NavCat[] }) {
  const { count, bump, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [bumping, setBumping] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!bump) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 650);
    return () => clearTimeout(t);
  }, [bump]);

  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!searchWrap.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => searchWrap.current?.querySelector("input")?.focus(), 30);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    drawer.current?.close();
  }, [pathname]);

  const links = [
    { href: "/", label: "Início" },
    { href: "/produtos", label: "Produtos" },
    { href: "/onde-estamos", label: "Onde estamos" },
    { href: "/#contato", label: "Contato" },
  ];

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <ColorBar />
      <div className="header-main">
        <div className="wrap">
          <button
            className="icon-btn menu-toggle"
            aria-label="Abrir menu"
            onClick={() => drawer.current?.showModal()}
          >
            <Icon name="menu" />
          </button>
          <Link href="/" className="brand" aria-label="Click Impresso, página inicial">
            <img src="/img/logotipo.png" alt="Click Impresso" width={1000} height={426} />
          </Link>
          <nav className="nav-main" aria-label="Principal">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="search-pop hide-mobile" ref={searchWrap}>
              <button
                className="icon-btn"
                aria-label="Buscar produtos"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((o) => !o)}
              >
                <Icon name={searchOpen ? "close" : "search"} size={22} />
              </button>
              {searchOpen && <Search cats={cats} />}
            </div>
            <Link href="/perfil" className="icon-btn hide-mobile" aria-label="Meu perfil">
              <Icon name="user" size={22} />
            </Link>
            <Link
              href="/carrinho"
              className={`icon-btn cart-btn${bumping ? " bump" : ""}`}
              aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
            >
              <Icon name="cart" size={24} />
              {ready && count > 0 && (
                <span className="count num" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <dialog
        ref={drawer}
        className="drawer"
        aria-label="Menu"
        onClick={(e) => {
          if (e.target === drawer.current) drawer.current?.close();
        }}
      >
        <div className="drawer-head">
          <img src="/img/logotipo.png" alt="Click Impresso" width={110} height={47} />
          <button className="icon-btn" aria-label="Fechar menu" onClick={() => drawer.current?.close()}>
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-search">
            <Search cats={cats} onNavigate={() => drawer.current?.close()} />
          </div>
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => drawer.current?.close()}>
                  {l.label} <Icon name="arrowRight" size={18} />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/perfil" onClick={() => drawer.current?.close()}>
                Meu perfil <Icon name="arrowRight" size={18} />
              </Link>
            </li>
            <li>
              <Link href="/carrinho" onClick={() => drawer.current?.close()}>
                Carrinho <span className="num">{count}</span>
              </Link>
            </li>
          </ul>
          <h2 className="label">Categorias</h2>
          <ul>
            {cats.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categoria/${c.slug}`}
                  onClick={() => drawer.current?.close()}
                >
                  {c.name} <span className="num">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="label">Por segmento</h2>
          <ul>
            {segs.map((t) => (
              <li key={t.slug}>
                <Link href={`/segmento/${t.slug}`} onClick={() => drawer.current?.close()}>
                  {t.name} <span className="num">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="label">Institucional</h2>
          <ul>
            <li><Link href="/sobre" onClick={() => drawer.current?.close()}>Sobre</Link></li>
            <li><Link href="/ajuda" onClick={() => drawer.current?.close()}>Ajuda</Link></li>
          </ul>
        </div>
      </dialog>
    </header>
  );
}

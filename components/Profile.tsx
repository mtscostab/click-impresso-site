"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { cities, cityOf, stores } from "@/lib/stores";
import { Select } from "./ui/Select";
import { digitsOnlyKey, maskCep, maskPhone } from "@/lib/masks";

type Data = { nome: string; email: string; telefone: string; empresa: string; cep: string; endereco: string; cidade: string; loja: string };
const EMPTY: Data = { nome: "", email: "", telefone: "", empresa: "", cep: "", endereco: "", cidade: "", loja: stores[0].name };
const KEY = "clickimpresso:perfil:v1";
const TABS = [
  { id: "dados", label: "Meus dados", icon: "user" },
  { id: "entrega", label: "Entrega e retirada", icon: "truck" },
  { id: "pedidos", label: "Pedidos", icon: "file" },
] as const;

export function Profile() {
  const { items, subtotal, ready } = useCart();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dados");
  const [data, setData] = useState<Data>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  const set = (k: keyof Data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setData((d) => ({ ...d, [k]: e.target.value }));
  const initials = data.nome.trim() ? data.nome.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "CI";

  return (
    <div className="wrap">
      <header className="page-hero" style={{ paddingBottom: 24 }}>
        <h1 className="display">Meu perfil</h1>
        <p className="lede">
          Seus dados ficam salvos só neste navegador. O login e o histórico de pedidos da conta Click ficam fora deste protótipo.
        </p>
      </header>
      <div className="profile">
        <nav className="profile-nav" role="tablist" aria-label="Seções do perfil">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={18} /> {t.label}
            </button>
          ))}
        </nav>

        <form className="profile-card" onSubmit={save} role="tabpanel">
          <div className="profile-head">
            <span className="avatar" aria-hidden="true">{initials}</span>
            <div>
              <h2 className="h-sub">{data.nome || "Olá!"}</h2>
              <p className="lede" style={{ fontSize: "0.92rem" }}>{data.email || "Complete seus dados para agilizar o pedido."}</p>
            </div>
          </div>

          {tab === "dados" && (
            <div className="form-grid">
              <div className="field"><label htmlFor="p-nome">Nome</label><input id="p-nome" value={data.nome} onChange={set("nome")} autoComplete="name" /></div>
              <div className="field"><label htmlFor="p-email">E-mail</label><input id="p-email" type="email" inputMode="email" placeholder="nome@empresa.com.br" value={data.email} onChange={set("email")} autoComplete="email" /></div>
              <div className="field"><label htmlFor="p-tel">Telefone</label><input id="p-tel" type="tel" inputMode="numeric" placeholder="(51) 99999-9999" value={data.telefone} onKeyDown={digitsOnlyKey} onChange={(e) => setData((d) => ({ ...d, telefone: maskPhone(e.target.value) }))} autoComplete="tel-national" /></div>
              <div className="field"><label htmlFor="p-emp">Empresa (opcional)</label><input id="p-emp" value={data.empresa} onChange={set("empresa")} autoComplete="organization" /></div>
            </div>
          )}

          {tab === "entrega" && (
            <div className="form-grid">
              <div className="field"><label htmlFor="p-cep">CEP</label><input id="p-cep" inputMode="numeric" placeholder="00000-000" value={data.cep} onKeyDown={digitsOnlyKey} onChange={(e) => setData((d) => ({ ...d, cep: maskCep(e.target.value) }))} autoComplete="postal-code" /></div>
              <div className="field"><label htmlFor="p-cid">Cidade</label><input id="p-cid" value={data.cidade} onChange={set("cidade")} autoComplete="address-level2" /></div>
              <div className="field full"><label htmlFor="p-end">Endereço</label><input id="p-end" value={data.endereco} onChange={set("endereco")} autoComplete="street-address" /></div>
              <div className="field full">
                <Select
                  label="Loja preferida para retirada"
                  value={data.loja}
                  onChange={(v) => setData((d) => ({ ...d, loja: v }))}
                  options={cities.flatMap((c) =>
                    stores.filter((s) => cityOf(s) === c).map((s) => ({ value: s.name, label: s.name, hint: s.address, group: c })),
                  )}
                />
              </div>
            </div>
          )}

          {tab === "pedidos" && (
            <div style={{ display: "grid", gap: 10 }}>
              <h3 className="h-sub" style={{ fontSize: "1.1rem" }}>Carrinho atual</h3>
              {!ready ? null : items.length === 0 ? (
                <p className="lede">Nenhum item no carrinho. <Link href="/produtos">Ver produtos</Link></p>
              ) : (
                <>
                  {items.map((i) => (
                    <div className="order-row" key={i.key}>
                      <img src={i.image} alt="" />
                      <div>
                        <strong>{i.title}</strong>
                        <div className="num" style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>{i.tier.qty} un · {i.paper}</div>
                      </div>
                      <strong className="num">{formatBRL(i.tier.price)}</strong>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span className="num">Total: <strong>{formatBRL(subtotal)}</strong></span>
                    <Link href="/carrinho" className="btn btn-primary">Ir para o carrinho</Link>
                  </div>
                </>
              )}
              <p className="note"><Icon name="info" size={16} /> Pedidos já finalizados aparecem aqui quando o login estiver ativo.</p>
            </div>
          )}

          {tab !== "pedidos" && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" type="submit"><Icon name={saved ? "check" : "file"} size={18} /> {saved ? "Salvo" : "Salvar dados"}</button>
              {saved && <span role="status" className="lede" style={{ fontSize: "0.9rem" }}>Dados salvos neste navegador.</span>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

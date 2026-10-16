"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { digitsOnlyKey, isEmail, isPhone, maskPhone } from "@/lib/masks";

type Field = "nome" | "email" | "telefone" | "mensagem";
type Errors = Partial<Record<Field, string>>;

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (!v.nome.trim()) e.nome = "Informe seu nome para a gente saber com quem fala.";
  if (!v.email.trim()) e.email = "Informe um e-mail para a resposta.";
  else if (!isEmail(v.email)) e.email = "Use o formato nome@empresa.com.br.";
  if (v.telefone && !isPhone(v.telefone)) e.telefone = "Use DDD + número: (51) 99999-9999.";
  if (v.mensagem.trim().length < 5) e.mensagem = "Escreva a mensagem, com o produto e a quantidade se for orçamento.";
  return e;
}

export function ContactForm() {
  const [v, setV] = useState<Record<Field, string>>({ nome: "", email: "", telefone: "", mensagem: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sent, setSent] = useState(false);
  const errors = validate(v);
  const show = (f: Field) => (touched[f] ? errors[f] : undefined);
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ nome: true, email: true, telefone: true, mensagem: true });
    const first = (Object.keys(errors) as Field[])[0];
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSent(true);
    setV({ nome: "", email: "", telefone: "", mensagem: "" });
    setTouched({});
  }

  const err = (f: Field) =>
    show(f) ? (
      <span className="err" id={`${f}-err`}>
        {show(f)}
      </span>
    ) : null;

  return (
    <form className="form" noValidate onSubmit={onSubmit}>
      <h2 className="h-sub form-title">Envie uma mensagem</h2>
      <div className="field">
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" autoComplete="name" value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} onBlur={blur("nome")} aria-invalid={!!show("nome")} aria-describedby={show("nome") ? "nome-err" : undefined} />
        {err("nome")}
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@empresa.com.br"
          value={v.email}
          onChange={(e) => setV({ ...v, email: e.target.value.replace(/\s/g, "") })}
          onBlur={blur("email")}
          aria-invalid={!!show("email")}
          aria-describedby={show("email") ? "email-err" : undefined}
        />
        {err("email")}
      </div>
      <div className="field">
        <label htmlFor="telefone">Telefone ou WhatsApp (opcional)</label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(51) 99999-9999"
          value={v.telefone}
          onKeyDown={digitsOnlyKey}
          onChange={(e) => setV({ ...v, telefone: maskPhone(e.target.value) })}
          onBlur={blur("telefone")}
          aria-invalid={!!show("telefone")}
          aria-describedby={show("telefone") ? "telefone-err" : undefined}
        />
        {err("telefone")}
      </div>
      <div className="field">
        <label htmlFor="mensagem">Mensagem</label>
        <textarea id="mensagem" name="mensagem" rows={4} value={v.mensagem} onChange={(e) => setV({ ...v, mensagem: e.target.value })} onBlur={blur("mensagem")} aria-invalid={!!show("mensagem")} aria-describedby={show("mensagem") ? "mensagem-err" : undefined} />
        {err("mensagem")}
      </div>
      <button className="btn btn-primary btn-lg" type="submit" style={{ justifySelf: "start" }}>
        Enviar mensagem
      </button>
      {sent && (
        <p className="notice" role="status">
          <Icon name="check" size={18} />
          Mensagem validada. Neste protótipo local ela não é enviada; no site, segue para atendimento@clickimpresso.com.br.
        </p>
      )}
    </form>
  );
}

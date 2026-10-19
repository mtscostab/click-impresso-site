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
      <p className="form-preview-note">Nesta versão de apresentação, o formulário apenas valida os dados. Para falar com a equipe, use os contatos ao lado.</p>
      <div className="field">
        <label htmlFor="nome">Nome (obrigatório)</label>
        <input id="nome" name="nome" required autoComplete="name" value={v.nome} onChange={(e) => { setSent(false); setV({ ...v, nome: e.target.value }); }} onBlur={blur("nome")} aria-invalid={!!show("nome")} aria-describedby={show("nome") ? "nome-err" : undefined} />
        {err("nome")}
      </div>
      <div className="field">
        <label htmlFor="email">E-mail (obrigatório)</label>
        <input
          id="email"
          name="email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nome@empresa.com.br"
          value={v.email}
          onChange={(e) => { setSent(false); setV({ ...v, email: e.target.value.replace(/\s/g, "") }); }}
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
          onChange={(e) => { setSent(false); setV({ ...v, telefone: maskPhone(e.target.value) }); }}
          onBlur={blur("telefone")}
          aria-invalid={!!show("telefone")}
          aria-describedby={show("telefone") ? "telefone-err" : undefined}
        />
        {err("telefone")}
      </div>
      <div className="field">
        <label htmlFor="mensagem">Mensagem (obrigatória)</label>
        <textarea id="mensagem" name="mensagem" required rows={4} value={v.mensagem} onChange={(e) => { setSent(false); setV({ ...v, mensagem: e.target.value }); }} onBlur={blur("mensagem")} aria-invalid={!!show("mensagem")} aria-describedby={show("mensagem") ? "mensagem-err" : undefined} />
        {err("mensagem")}
      </div>
      <button className="btn btn-primary btn-lg" type="submit" style={{ justifySelf: "start" }}>
        Enviar mensagem
      </button>
      {sent && (
        <p className="notice" role="status">
          <Icon name="check" size={18} />
          Dados validados. Nenhuma mensagem foi enviada nesta versão. Seus campos foram mantidos para você copiar e falar com a equipe.
        </p>
      )}
    </form>
  );
}

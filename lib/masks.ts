/** Telefone brasileiro: aceita só dígitos e formata (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX. */
export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (d.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function isPhone(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

export function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/i.test(v.trim());
}

/** Bloqueia teclas que não são dígito em campos numéricos (setas, apagar e atalhos seguem livres). */
export function digitsOnlyKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
}

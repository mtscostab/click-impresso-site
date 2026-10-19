"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";

export type SelectOption = { value: string; label: string; hint?: string; group?: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  /** rótulo visível acima do campo */
  placeholder?: string;
  size?: "md" | "sm";
  id?: string;
  className?: string;
};

/**
 * Lista suspensa própria: mesma pílula/raio/sombra da interface, teclado completo
 * (setas, Home/End, Enter, Esc, digitação para buscar) e grupos opcionais.
 */
export function Select({ value, options, onChange, label, placeholder = "Selecione", size = "md", id, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const baseId = id ?? autoId;
  const typed = useRef({ text: "", t: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const groups = useMemo(() => {
    const out: { name?: string; items: { o: SelectOption; i: number }[] }[] = [];
    options.forEach((o, i) => {
      const last = out[out.length - 1];
      if (!last || last.name !== o.group) out.push({ name: o.group, items: [{ o, i }] });
      else last.items.push({ o, i });
    });
    return out;
  }, [options]);

  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(i: number) {
    if (!options[i]) return;
    onChange(options[i].value);
    setOpen(false);
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1) {
      const now = Date.now();
      typed.current.text = (now - typed.current.t > 700 ? "" : typed.current.text) + e.key.toLowerCase();
      typed.current.t = now;
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  }

  return (
    <div className={`sel sel-${size}${open ? " open" : ""} ${className}`} ref={root}>
      {label && (
        <span className="sel-label" id={`${baseId}-l`}>
          {label}
        </span>
      )}
      <button
        type="button"
        className="sel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${baseId}-l ${baseId}-v` : undefined}
        disabled={options.length === 0}
        aria-controls={open ? `${baseId}-list` : undefined}
        onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false); }}
        aria-activedescendant={open ? `${baseId}-o${active}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
      >
        <span id={`${baseId}-v`} className={selected ? "" : "ph"}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevron" size={18} className="sel-chev" />
      </button>
      {open && (
        <ul className="sel-list" role="listbox" id={`${baseId}-list`} ref={list} tabIndex={-1} data-lenis-prevent>
          {groups.map((g, gi) => (
            <li key={gi} role="presentation">
              {g.name && <span className="sel-group">{g.name}</span>}
              <ul role="group" aria-label={g.name}>
                {g.items.map(({ o, i }) => (
                  <li
                    key={o.value}
                    id={`${baseId}-o${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={o.value === value}
                    className={`sel-opt${i === active ? " active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                  >
                    <span>
                      {o.label}
                      {o.hint && <small>{o.hint}</small>}
                    </span>
                    {o.value === value && <Icon name="check" size={16} />}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

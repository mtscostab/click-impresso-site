"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Tier } from "./format";

export type CartItem = {
  key: string;
  productId: string;
  title: string;
  image: string;
  paper: string;
  finishes: string[];
  tier: Tier;
  /** faixas disponíveis, para trocar a quantidade no carrinho */
  tiers?: Tier[];
  productionDays: number | null;
};

type Toast = { id: number; message: string; actionLabel?: string; action?: () => void };

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  updateTier: (key: string, tier: Tier) => void;
  clear: () => void;
  toast: Toast | null;
  notify: (t: Omit<Toast, "id">) => void;
  dismissToast: () => void;
  bump: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "clickimpresso:carrinho:v1";

function itemKey(i: Omit<CartItem, "key">) {
  return [i.productId, i.paper, [...i.finishes].sort().join("+")].join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [bump, setBump] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const dismissToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const notify = useCallback((t: Omit<Toast, "id">) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 5200);
  }, []);

  const add = useCallback(
    (raw: Omit<CartItem, "key">) => {
      const key = itemKey(raw);
      setItems((prev) => {
        const existing = prev.find((x) => x.key === key);
        if (existing) return prev.map((x) => (x.key === key ? { ...x, tier: raw.tier } : x));
        return [...prev, { ...raw, key }];
      });
      setBump((b) => b + 1);
    },
    [],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const remove = useCallback(
    (key: string) => {
      const index = itemsRef.current.findIndex((x) => x.key === key);
      if (index < 0) return;
      const removed = itemsRef.current[index];
      setItems((prev) => prev.filter((x) => x.key !== key));
      notify({
        message: `${removed.title} saiu do carrinho.`,
        actionLabel: "Desfazer",
        action: () =>
          setItems((now) => {
            if (now.some((x) => x.key === key)) return now;
            const next = [...now];
            next.splice(Math.min(index, next.length), 0, removed);
            return next;
          }),
      });
    },
    [notify],
  );

  const updateTier = useCallback((key: string, tier: Tier) => {
    setItems((prev) => prev.map((x) => (x.key === key ? { ...x, tier } : x)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.length,
      subtotal: items.reduce((sum, i) => sum + i.tier.price, 0),
      add,
      remove,
      updateTier,
      clear,
      toast,
      notify,
      dismissToast,
      bump,
    }),
    [items, ready, add, remove, updateTier, clear, toast, notify, dismissToast, bump],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa do CartProvider");
  return ctx;
}

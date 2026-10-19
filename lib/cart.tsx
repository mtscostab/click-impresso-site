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

function isTier(value: unknown): value is Tier {
  if (!value || typeof value !== "object") return false;
  const t = value as Tier;
  return Number.isFinite(t.qty) && t.qty > 0 && Number.isFinite(t.price) && t.price >= 0;
}
function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const i = value as CartItem;
  return [i.key, i.productId, i.title, i.image, i.paper].every((v) => typeof v === "string")
    && Array.isArray(i.finishes) && i.finishes.every((v) => typeof v === "string")
    && isTier(i.tier) && (i.tiers === undefined || (Array.isArray(i.tiers) && i.tiers.every(isTier)))
    && (i.productionDays === null || (Number.isFinite(i.productionDays) && i.productionDays >= 0));
}

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
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

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

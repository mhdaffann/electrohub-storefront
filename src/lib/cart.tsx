// Client-side cart. Kept behind a small context API so it can later sync to a
// database (per signed-in user) and hand line items to a checkout session.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/data/products";

export interface CartLine { id: string; qty: number }
interface CartCtx {
  lines: (CartLine & { product: Product })[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "electrohub-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  useEffect(() => {
    try { setRaw(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  const save = (next: CartLine[]) => { setRaw(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const value = useMemo<CartCtx>(() => {
    const lines = raw.flatMap((l) => { const product = getProduct(l.id); return product ? [{ ...l, product }] : []; });
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
      add: (id, qty = 1) => {
        const ex = raw.find((l) => l.id === id);
        save(ex ? raw.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...raw, { id, qty }]);
      },
      setQty: (id, qty) => save(raw.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.floor(qty)) } : l))),
      remove: (id) => save(raw.filter((l) => l.id !== id)),
      clear: () => save([]),
    };
  }, [raw]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

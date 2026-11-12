// Builds an order from cart quantities and products read from the database.
// Prices always come from the database rows, never from the browser.
import { calcTotals } from "@/lib/pricing";
import { MAX_ITEM_QTY } from "@/lib/checkout-validation";

export interface PricedProductRow { id: string; name: string; price: number; is_active: boolean }
export interface OrderLine { product_id: string; product_name: string; unit_price: number; quantity: number }
export type BuiltOrder =
  | { ok: true; items: OrderLine[]; subtotal: number; delivery: number; total: number }
  | { ok: false; error: string; unavailable: string[] };

export function buildOrder(cart: { productId: string; quantity: number }[], rows: PricedProductRow[]): BuiltOrder {
  const merged = new Map<string, number>();
  for (const l of cart) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);
  if (merged.size === 0) return { ok: false, error: "Your cart is empty.", unavailable: [] };

  const byId = new Map(rows.map((r) => [r.id, r]));
  const unavailable = [...merged.keys()].filter((id) => !byId.get(id)?.is_active);
  if (unavailable.length) return { ok: false, error: "Some items in your cart are no longer available. Remove them and try again.", unavailable };
  for (const qty of merged.values()) {
    if (qty > MAX_ITEM_QTY) return { ok: false, error: `You can order up to ${MAX_ITEM_QTY} of one product.`, unavailable: [] };
  }

  const items = [...merged].map(([id, quantity]) => {
    const row = byId.get(id)!;
    return { product_id: id, product_name: row.name, unit_price: row.price, quantity };
  });
  const { subtotal, delivery, total } = calcTotals(items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  return { ok: true, items, subtotal, delivery, total };
}

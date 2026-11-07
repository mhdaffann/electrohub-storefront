import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR, type Product } from "@/data/products";
import { calcTotals, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import type { ReactNode } from "react";

export function QuantityStepper({ qty, onChange, size = "md" }: { qty: number; onChange: (q: number) => void; size?: "md" | "sm" }) {
  const btn = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border bg-card">
      <button className={`${btn} grid place-items-center disabled:opacity-30`} onClick={() => onChange(qty - 1)} disabled={qty <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
      <button className={`${btn} grid place-items-center`} onClick={() => onChange(qty + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function CartItem({ product, qty, onQty, onRemove }: { product: Product; qty: number; onQty: (q: number) => void; onRemove: () => void }) {
  return (
    <li className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card">
      <Link to="/product/$id" params={{ id: product.id }} className="shrink-0">
        <img src={product.image} alt={product.name} width={816} height={816} loading="lazy" className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to="/product/$id" params={{ id: product.id }} className="font-semibold leading-snug hover:text-primary">{product.name}</Link>
          <button onClick={onRemove} className="shrink-0 text-muted-foreground transition hover:text-destructive" aria-label={`Remove ${product.name}`}><Trash2 className="h-5 w-5" /></button>
        </div>
        <span className="mt-1 text-sm text-muted-foreground">{formatINR(product.price)} each</span>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <QuantityStepper qty={qty} onChange={onQty} size="sm" />
          <span className="font-bold">{formatINR(product.price * qty)}</span>
        </div>
      </div>
    </li>
  );
}

export function OrderSummary({ subtotal, count, children }: { subtotal: number; count: number; children?: ReactNode }) {
  const { delivery, total } = calcTotals(subtotal);
  return (
    <aside className="h-fit space-y-3 rounded-2xl border bg-card p-6 shadow-card lg:sticky lg:top-28">
      <h2 className="font-display text-lg font-bold">Order summary</h2>
      <div className="flex justify-between text-sm"><span>Subtotal ({count} item{count === 1 ? "" : "s"})</span><span>{formatINR(subtotal)}</span></div>
      <div className="flex justify-between text-sm"><span>Delivery</span><span className={delivery ? "" : "font-semibold text-success"}>{delivery ? formatINR(delivery) : "Free"}</span></div>
      {delivery > 0 && <p className="text-xs text-muted-foreground">Add {formatINR(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.</p>}
      <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
      <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
      {children}
    </aside>
  );
}

export function EmptyCart() {
  return (
    <div className="container-x flex flex-col items-center py-20 text-center">
      <div className="relative mb-6 grid h-40 w-40 place-items-center rounded-full bg-accent">
        <ShoppingBag className="h-16 w-16 text-primary" strokeWidth={1.5} />
        <span className="absolute right-6 top-8 h-3 w-3 rounded-full bg-primary/40" />
        <span className="absolute bottom-8 left-5 h-2 w-2 rounded-full bg-primary/60" />
      </div>
      <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">Looks like you haven't added anything yet. Discover the latest gadgets and great deals.</p>
      <Link to="/products" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lift transition hover:brightness-110">Continue Shopping</Link>
    </div>
  );
}

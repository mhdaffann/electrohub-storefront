import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { formatINR } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ElectroHub" },
      { name: "description", content: "Review the items in your ElectroHub cart." },
      { property: "og:title", content: "Your Cart — ElectroHub" },
      { property: "og:description", content: "Review the items in your ElectroHub cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, setQty, remove } = useCart();
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;

  if (!lines.length)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover the latest gadgets and great deals.</p>
        <Link to="/products" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Start shopping</Link>
      </div>
    );

  return (
    <div className="container-x py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {lines.map(({ id, qty, product }) => (
            <li key={id} className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card">
              <img src={product.image} alt={product.name} width={816} height={816} loading="lazy" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to="/product/$id" params={{ id }} className="font-semibold hover:text-primary">{product.name}</Link>
                <span className="mt-1 font-bold">{formatINR(product.price)}</span>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border">
                    <button className="h-9 w-9" onClick={() => setQty(id, qty - 1)} aria-label="Decrease">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                    <button className="h-9 w-9" onClick={() => setQty(id, qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <button onClick={() => remove(id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-5 w-5" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-3 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping ? formatINR(shipping) : "Free"}</span></div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span>{formatINR(subtotal + shipping)}</span></div>
          <button disabled className="w-full cursor-not-allowed rounded-full bg-primary py-3 font-semibold text-primary-foreground opacity-60">Checkout coming soon</button>
          <p className="text-center text-xs text-muted-foreground">Secure online payments will be enabled soon.</p>
        </aside>
      </div>
    </div>
  );
}

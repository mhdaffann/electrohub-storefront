import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { formatINR } from "@/data/products";
import { useCart } from "@/lib/cart";
import { EmptyCart, OrderSummary } from "@/components/site/CartParts";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ElectroHub" },
      { name: "description", content: "Enter delivery details and review your ElectroHub order." },
      { property: "og:title", content: "Checkout — ElectroHub" },
      { property: "og:description", content: "Review your ElectroHub order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const field = "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <input className={field} {...props} />
    </label>
  );
}

function Checkout() {
  const { lines, count, subtotal } = useCart();
  if (!lines.length) return <EmptyCart />;

  return (
    <div className="container-x py-10">
      <Link to="/cart" className="text-sm font-semibold text-primary">← Back to cart</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg font-bold">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" autoComplete="name" />
              <Field label="Mobile number" type="tel" autoComplete="tel" />
              <Field label="Address" autoComplete="street-address" className="sm:col-span-2" />
              <Field label="City" autoComplete="address-level2" />
              <Field label="State" autoComplete="address-level1" />
              <Field label="PIN code" inputMode="numeric" autoComplete="postal-code" />
              <Field label="Email" type="email" autoComplete="email" />
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-2 font-display text-lg font-bold">Payment</h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Secure online payment will be available soon.</p>
          </section>
        </form>
        <OrderSummary subtotal={subtotal} count={count}>
          <ul className="space-y-2 border-t pt-3 text-sm">
            {lines.map(({ id, qty, product }) => (
              <li key={id} className="flex justify-between gap-3"><span className="line-clamp-1">{product.name} × {qty}</span><span className="shrink-0">{formatINR(product.price * qty)}</span></li>
            ))}
          </ul>
          <button disabled className="w-full cursor-not-allowed rounded-full bg-primary py-3 font-semibold text-primary-foreground opacity-60">Place order (coming soon)</button>
        </OrderSummary>
      </div>
    </div>
  );
}

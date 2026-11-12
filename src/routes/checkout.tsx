import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type FormEvent } from "react";
import { FlaskConical, Info, LogIn } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { deliveryAddressSchema, type DeliveryAddress } from "@/lib/checkout-validation";
import { placeDemoOrder } from "@/lib/checkout.functions";
import { EmptyCart, OrderSummary } from "@/components/site/CartParts";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Demo Checkout — ElectroHub" },
      { name: "description", content: "Enter delivery details and place a demo order at ElectroHub. No payment is taken." },
      { property: "og:title", content: "Demo Checkout — ElectroHub" },
      { property: "og:description", content: "Review your ElectroHub order and place a demo order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type FieldName = keyof DeliveryAddress;
const EMPTY: Record<FieldName, string> = { fullName: "", phone: "", address: "", city: "", state: "", pin: "" };
const field = "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive";

function Field({ label, name, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: FieldName; error?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <input name={name} className={field} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} {...props} />
      {error && <span id={`${name}-error`} className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function DemoBanner() {
  return (
    <div role="note" className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <p><strong className="font-display tracking-wide">DEMO CHECKOUT</strong> — no payment is taken and no card details are collected. Placing an order saves it to your account for demonstration only.</p>
    </div>
  );
}

function Checkout() {
  const { lines, count, subtotal, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const place = useServerFn(placeDemoOrder);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // One key per cart version: a double click or retry of the same cart returns the same order.
  const cartSignature = lines.map((l) => `${l.id}:${l.qty}`).join(",");
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [cartSignature]);

  if (!lines.length) return <EmptyCart />;

  const set = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = deliveryAddressSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) { const k = issue.path[0] as FieldName; next[k] ??= issue.message; }
      setErrors(next);
      return;
    }
    setSubmitting(true);
    try {
      const result = await place({ data: { idempotencyKey, address: parsed.data, items: lines.map((l) => ({ productId: l.id, quantity: l.qty })) } });
      if (!result.ok) {
        const names = result.unavailable.map((id) => lines.find((l) => l.id === id)?.product.name ?? id);
        setFormError(names.length ? `${result.error} (${names.join(", ")})` : result.error);
        return;
      }
      await navigate({ to: "/order/$id", params: { id: result.orderId } });
      clear();
      toast.success("Demo order placed");
    } catch {
      setFormError("Your order couldn't be placed. Your cart is unchanged — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-10">
      <Link to="/cart" className="text-sm font-semibold text-primary">← Back to cart</Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-bold">Checkout</h1>
      <DemoBanner />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form id="checkout-form" onSubmit={onSubmit} noValidate className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg font-bold">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="fullName" autoComplete="name" value={values.fullName} onChange={set("fullName")} error={errors.fullName} maxLength={100} />
              <Field label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit number" value={values.phone} onChange={set("phone")} error={errors.phone} maxLength={16} />
              <Field label="Address" name="address" autoComplete="street-address" placeholder="House no., street, area" className="sm:col-span-2" value={values.address} onChange={set("address")} error={errors.address} maxLength={200} />
              <Field label="City" name="city" autoComplete="address-level2" value={values.city} onChange={set("city")} error={errors.city} maxLength={60} />
              <Field label="State" name="state" autoComplete="address-level1" value={values.state} onChange={set("state")} error={errors.state} maxLength={60} />
              <Field label="PIN code" name="pin" inputMode="numeric" autoComplete="postal-code" value={values.pin} onChange={set("pin")} error={errors.pin} maxLength={6} />
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-2 font-display text-lg font-bold">Payment</h2>
            <p className="flex items-start gap-2 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Payment is not collected in demo checkout. Your order will be saved as "Not charged".</p>
          </section>
        </form>
        <OrderSummary subtotal={subtotal} count={count}>
          <ul className="space-y-3 border-t pt-3 text-sm">
            {lines.map(({ id, qty, product }) => (
              <li key={id} className="flex items-center gap-3">
                <img src={product.image} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="line-clamp-2 font-medium leading-snug">{product.name}</p><p className="text-muted-foreground">{qty} × {formatINR(product.price)}</p></div>
                <span className="shrink-0 font-semibold">{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          {formError && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
          {loading ? (
            <p role="status" className="text-center text-sm text-muted-foreground">Checking your sign-in…</p>
          ) : user ? (
            <button type="submit" form="checkout-form" disabled={submitting} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-lift transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Placing demo order…" : "Place demo order"}
            </button>
          ) : (
            <div className="space-y-2 text-center">
              <Link to="/auth" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-lift transition hover:brightness-110"><LogIn className="h-4 w-4" />Log in to place order</Link>
              <p className="text-xs text-muted-foreground">Your cart is kept while you log in.</p>
            </div>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}

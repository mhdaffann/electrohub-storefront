import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/data/products";
import { useCatalog } from "@/lib/catalog";
import { orderNumber, orderStatus, paymentStatus } from "@/lib/order-status";
import { StatusPill } from "@/components/account/StatusPill";

export const Route = createFileRoute("/_authenticated/order/$id")({
  head: () => ({ meta: [
    { title: "Order Confirmation — ElectroHub" },
    { name: "description", content: "Details of your ElectroHub order." },
    { property: "og:title", content: "Order Confirmation — ElectroHub" },
    { property: "og:description", content: "Details of your ElectroHub order." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: OrderPage,
});

interface Address { fullName?: string; phone?: string; address?: string; city?: string; state?: string; pin?: string }
const formatDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

function OrderPage() {
  const { id } = Route.useParams();
  const { getProduct } = useCatalog();
  // Access rules only return the order if it belongs to the signed-in customer.
  const order = useQuery({ queryKey: ["order", id], queryFn: async () => {
    const { data, error } = await supabase.from("orders")
      .select("id, status, subtotal, delivery_charge, total, shipping_address, payment_reference, is_demo, created_at, order_items(id, product_id, product_name, quantity, unit_price, line_total)")
      .eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  } });

  if (order.isPending) return <p role="status" className="container-x py-16 text-muted-foreground">Loading your order…</p>;
  if (order.isError) return <div role="alert" className="container-x py-16"><p className="text-destructive">Your order could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => void order.refetch()}>Try again</Button></div>;
  if (!order.data) return <div className="container-x py-16 text-center"><h1 className="font-display text-2xl font-bold">Order not found</h1><p className="mt-2 text-muted-foreground">This order doesn't exist or isn't on your account.</p><Button asChild className="mt-5 rounded-full"><Link to="/account">My orders</Link></Button></div>;

  const o = order.data;
  const a = (o.shipping_address ?? {}) as Address;
  return <div className="container-x max-w-3xl py-10 sm:py-14">
    <div className="mb-8 text-center">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">{o.is_demo ? <FlaskConical className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}</span>
      <h1 className="font-display text-3xl font-bold">{o.is_demo ? "Demo order placed" : "Order received"}</h1>
      <p className="mt-2 text-muted-foreground">Order {orderNumber(o.id)} · {formatDate(o.created_at)}</p>
      {o.is_demo && <p className="mx-auto mt-4 max-w-md rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm text-accent-foreground"><strong>DEMO ORDER</strong> — no payment was taken and nothing will be shipped.</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2"><StatusPill prefix="Order" {...orderStatus(o.status, o.is_demo)} /><StatusPill prefix="Payment" {...paymentStatus(o.status, o.payment_reference, o.is_demo)} /></div>
    </div>

    <section className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <h2 className="border-b bg-secondary/60 px-5 py-3 font-display font-semibold">Items</h2>
      <ul className="divide-y px-5">
        {o.order_items.map((item) => { const img = item.product_id ? getProduct(item.product_id)?.image : undefined; return <li key={item.id} className="flex items-center gap-4 py-3 text-sm">
          {img ? <img src={img} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <span className="h-14 w-14 shrink-0 rounded-lg bg-secondary" />}
          <div className="min-w-0 flex-1"><p className="break-words font-medium">{item.product_name}</p><p className="text-muted-foreground">Qty {item.quantity} × {formatINR(item.unit_price)}</p></div>
          <p className="shrink-0 font-semibold">{formatINR(item.line_total ?? item.unit_price * item.quantity)}</p>
        </li>; })}
      </ul>
      <dl className="space-y-2 border-t px-5 py-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Delivery</dt><dd className={o.delivery_charge ? "" : "font-semibold text-success"}>{o.delivery_charge ? formatINR(o.delivery_charge) : "Free"}</dd></div>
        <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
      </dl>
    </section>

    <section className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
      <h2 className="mb-2 font-display font-semibold">Delivery address</h2>
      <address className="break-words text-sm not-italic text-muted-foreground">
        <span className="block font-medium text-foreground">{a.fullName}</span>
        {a.address}<br />{[a.city, a.state].filter(Boolean).join(", ")} {a.pin}<br />Mobile: {a.phone}
      </address>
    </section>

    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Button asChild variant="outline" className="rounded-full"><Link to="/account">View order history</Link></Button>
      <Button asChild className="rounded-full"><Link to="/products">Continue shopping</Link></Button>
    </div>
  </div>;
}

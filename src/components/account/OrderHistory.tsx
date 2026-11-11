import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/data/products";
import { orderNumber, orderStatus, paymentStatus } from "@/lib/order-status";
import { StatusPill } from "./StatusPill";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function OrderHistory({ userId }: { userId: string }) {
  // Access rules on the order tables only return the signed-in customer's own orders.
  const orders = useQuery({ queryKey: ["orders", userId], queryFn: async () => {
    const { data, error } = await supabase.from("orders")
      .select("id, status, total, created_at, payment_reference, order_items(id, product_name, quantity, unit_price, line_total)")
      .eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });

  if (orders.isPending) return <p role="status" className="text-muted-foreground">Loading your orders…</p>;
  if (orders.isError) return <div role="alert"><p className="text-destructive">Your orders could not be loaded.</p><Button variant="outline" className="mt-3" onClick={() => void orders.refetch()}>Try again</Button></div>;
  if (orders.data.length === 0) return <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
    <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent text-primary"><Package className="h-6 w-6" /></span>
    <h3 className="font-display text-lg font-semibold">No orders yet</h3>
    <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will appear here.</p>
    <Button asChild className="mt-5 rounded-full"><Link to="/products">Start shopping</Link></Button>
  </div>;

  return <ul className="space-y-4">
    {orders.data.map((o) => {
      const s = orderStatus(o.status); const p = paymentStatus(o.status, o.payment_reference);
      return <li key={o.id} className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-secondary/60 px-4 py-3 sm:px-5">
          <div><p className="font-display font-semibold" title={o.id}>Order {orderNumber(o.id)}</p><p className="text-sm text-muted-foreground">Placed {formatDate(o.created_at)}</p></div>
          <div className="flex flex-wrap gap-2"><StatusPill prefix="Order" {...s} /><StatusPill prefix="Payment" {...p} /></div>
        </div>
        <ul className="divide-y px-4 sm:px-5">
          {o.order_items.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
            <div className="min-w-0"><p className="break-words font-medium">{item.product_name}</p><p className="text-muted-foreground">Qty {item.quantity} × {formatINR(item.unit_price)}</p></div>
            <p className="shrink-0 font-semibold">{formatINR(item.line_total ?? item.unit_price * item.quantity)}</p>
          </li>)}
        </ul>
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5"><span className="text-sm text-muted-foreground">Order total</span><span className="font-display text-lg font-bold">{formatINR(o.total)}</span></div>
      </li>;
    })}
  </ul>;
}

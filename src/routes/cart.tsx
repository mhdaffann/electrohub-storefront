import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { CartItem, EmptyCart, OrderSummary } from "@/components/site/CartParts";

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
  const { lines, count, subtotal, setQty, remove, clear } = useCart();
  if (!lines.length) return <EmptyCart />;

  return (
    <div className="container-x py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Shopping cart</h1>
        <button
          onClick={() => { if (confirm("Remove all items from your cart?")) { clear(); toast("Cart cleared"); } }}
          className="text-sm font-semibold text-muted-foreground transition hover:text-destructive"
        >
          Clear cart
        </button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {lines.map(({ id, qty, product }) => (
            <CartItem key={id} product={product} qty={qty} onQty={(q) => setQty(id, q)} onRemove={() => { remove(id); toast(`${product.name} removed`); }} />
          ))}
        </ul>
        <OrderSummary subtotal={subtotal} count={count}>
          <Link to="/checkout" className="block w-full rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground shadow-lift transition hover:brightness-110">Proceed to Checkout</Link>
          <Link to="/products" className="block text-center text-sm font-semibold text-primary">Continue Shopping</Link>
        </OrderSummary>
      </div>
    </div>
  );
}

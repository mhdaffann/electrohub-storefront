import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { placeOrderSchema } from "@/lib/checkout-validation";
import { buildOrder } from "@/lib/order-builder";

export type PlaceOrderResult = { ok: true; orderId: string } | { ok: false; error: string; unavailable: string[] };

/** Demo checkout: saves an order for the signed-in customer. No payment is taken. */
export const placeDemoOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }): Promise<PlaceOrderResult> => {
    const ids = [...new Set(data.items.map((i) => i.productId))];
    // Read live prices and availability from the catalog (only active products are visible).
    const { data: rows, error } = await context.supabase.from("products").select("id, name, price, is_active").in("id", ids);
    if (error) {
      console.error("Checkout product lookup failed", error);
      return { ok: false, error: "We couldn't check your cart right now. Please try again.", unavailable: [] };
    }
    const order = buildOrder(data.items, rows ?? []);
    if (!order.ok) return order;

    // Orders are read-only for customers, so the save runs with server privileges after
    // the caller has been verified above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orderId, error: saveError } = await supabaseAdmin.rpc("create_demo_order", {
      _user_id: context.userId,
      _idempotency_key: data.idempotencyKey,
      _subtotal: order.subtotal,
      _delivery: order.delivery,
      _total: order.total,
      _address: data.address,
      _items: order.items as unknown as never,
    });
    if (saveError || !orderId) {
      console.error("Demo order save failed", saveError);
      return { ok: false, error: "Your order couldn't be saved. Your cart is unchanged — please try again.", unavailable: [] };
    }
    return { ok: true, orderId };
  });

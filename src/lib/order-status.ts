// Display rules for stored order states. Payment state is derived from the order status,
// because orders only reach "paid" or later once a real payment has been recorded.
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
export type Tone = "neutral" | "info" | "success" | "danger";

const ORDER: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "neutral" },
  paid: { label: "Confirmed", tone: "info" },
  shipped: { label: "Shipped", tone: "info" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};

const isStatus = (s: string): s is OrderStatus => s in ORDER;

export function orderStatus(status: string, isDemo = false) {
  if (isDemo && status === "pending") return { label: "Demo order", tone: "info" as Tone };
  return isStatus(status) ? ORDER[status] : { label: "Processing", tone: "neutral" as Tone };
}

export function paymentStatus(status: string, paymentReference: string | null, isDemo = false) {
  // Demo checkout never takes a payment, whatever the order status.
  if (isDemo) return { label: "Not charged (demo)", tone: "neutral" as Tone };
  if (status === "paid" || status === "shipped" || status === "delivered") return { label: "Paid", tone: "success" as Tone };
  if (status === "refunded") return { label: "Refunded", tone: "neutral" as Tone };
  if (status === "cancelled") return paymentReference ? { label: "Refund pending", tone: "danger" as Tone } : { label: "Not charged", tone: "neutral" as Tone };
  return { label: "Awaiting payment", tone: "neutral" as Tone };
}

/** Short, readable order number from the stored id. */
export const orderNumber = (id: string) => `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

import { describe, expect, it } from "vitest";
import { buildOrder } from "@/lib/order-builder";
import { deliveryAddressSchema, placeOrderSchema } from "@/lib/checkout-validation";
import { orderStatus, paymentStatus } from "@/lib/order-status";

const rows = [
  { id: "phone", name: "Phone", price: 500, is_active: true },
  { id: "laptop", name: "Laptop", price: 50000, is_active: true },
  { id: "old", name: "Old", price: 100, is_active: false },
];

describe("demo order building", () => {
  it("uses database prices and adds ₹99 delivery under ₹999", () => {
    const o = buildOrder([{ productId: "phone", quantity: 1 }], rows);
    expect(o).toMatchObject({ ok: true, subtotal: 500, delivery: 99, total: 599 });
  });
  it("gives free delivery from ₹999 and merges repeated lines", () => {
    const o = buildOrder([{ productId: "phone", quantity: 1 }, { productId: "phone", quantity: 1 }], rows);
    expect(o).toMatchObject({ ok: true, subtotal: 1000, delivery: 0, total: 1000 });
    if (o.ok) expect(o.items).toEqual([{ product_id: "phone", product_name: "Phone", unit_price: 500, quantity: 2 }]);
  });
  it("rejects unavailable or unknown products", () => {
    const o = buildOrder([{ productId: "old", quantity: 1 }, { productId: "ghost", quantity: 1 }, { productId: "phone", quantity: 1 }], rows);
    expect(o.ok).toBe(false);
    if (!o.ok) expect(o.unavailable).toEqual(["old", "ghost"]);
  });
  it("rejects more than 99 of one product", () => {
    expect(buildOrder([{ productId: "phone", quantity: 60 }, { productId: "phone", quantity: 40 }], rows).ok).toBe(false);
  });
});

describe("delivery address", () => {
  const valid = { fullName: "Muhammed Affan", phone: "+91 98765 43210", address: "12 MG Road, Indiranagar", city: "Bengaluru", state: "Karnataka", pin: "560038" };
  it("accepts Indian mobile numbers and stores 10 digits", () => {
    const r = deliveryAddressSchema.safeParse(valid);
    expect(r.success && r.data.phone).toBe("9876543210");
  });
  it("rejects invalid phone and PIN", () => {
    expect(deliveryAddressSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(deliveryAddressSchema.safeParse({ ...valid, phone: "5876543210" }).success).toBe(false);
    expect(deliveryAddressSchema.safeParse({ ...valid, pin: "056003" }).success).toBe(false);
    expect(deliveryAddressSchema.safeParse({ ...valid, pin: "5600" }).success).toBe(false);
  });
  it("rejects zero quantities and empty carts", () => {
    const base = { idempotencyKey: "6f1b2c3d-1111-4222-8333-944455556666", address: valid };
    expect(placeOrderSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(placeOrderSchema.safeParse({ ...base, items: [{ productId: "phone", quantity: 0 }] }).success).toBe(false);
  });
});

describe("demo order labels", () => {
  it("never shows a demo order as paid", () => {
    expect(paymentStatus("pending", null, true).label).toBe("Not charged (demo)");
    expect(paymentStatus("paid", "x", true).label).toBe("Not charged (demo)");
    expect(orderStatus("pending", true).label).toBe("Demo order");
  });
});

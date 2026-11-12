import { z } from "zod";

export const MAX_ITEM_QTY = 99;
export const MAX_ORDER_LINES = 50;

const text = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `Enter your ${label}.`).max(max, `Use no more than ${max} characters.`);

/** Indian mobile: 10 digits starting 6–9, optionally prefixed with +91 / 91 / 0. */
export const phoneSchema = z.string().trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number.")
  .transform((v) => v.slice(-10));

export const pinSchema = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code.");

export const deliveryAddressSchema = z.object({
  fullName: text("full name", 1, 100),
  phone: phoneSchema,
  address: z.string().trim().min(5, "Enter your full street address.").max(200, "Use no more than 200 characters."),
  city: text("city", 2, 60),
  state: text("state", 2, 60),
  pin: pinSchema,
});
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;

export const orderItemsSchema = z.array(z.object({
  productId: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(MAX_ITEM_QTY, `You can order up to ${MAX_ITEM_QTY} of one product.`),
})).min(1, "Your cart is empty.").max(MAX_ORDER_LINES);

export const placeOrderSchema = z.object({
  idempotencyKey: z.string().uuid(),
  address: deliveryAddressSchema,
  items: orderItemsSchema,
});
export type PlaceOrderInput = z.input<typeof placeOrderSchema>;

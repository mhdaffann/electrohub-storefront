import { describe, expect, it } from "vitest";
import { orderNumber, orderStatus, paymentStatus } from "@/lib/order-status";
import { RESEND_COOLDOWN_SECONDS, secondsLeft } from "@/lib/resend-cooldown";
import { profileSchema } from "@/lib/auth-validation";

describe("order display rules", () => {
  it("shows an order as paid once it is paid, shipped or delivered", () => {
    for (const s of ["paid", "shipped", "delivered"]) expect(paymentStatus(s, "pay_1").label).toBe("Paid");
  });
  it("shows pending orders as awaiting payment", () => {
    expect(paymentStatus("pending", null).label).toBe("Awaiting payment");
    expect(orderStatus("pending").label).toBe("Pending");
  });
  it("distinguishes cancelled orders that were charged", () => {
    expect(paymentStatus("cancelled", null).label).toBe("Not charged");
    expect(paymentStatus("cancelled", "pay_1").label).toBe("Refund pending");
  });
  it("shortens the order id to 8 characters", () => {
    expect(orderNumber("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("#A1B2C3D4");
  });
});

describe("resend confirmation cooldown", () => {
  it("waits 60 seconds between resend requests", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
    expect(secondsLeft(1_000_000, 1_000_000)).toBe(60);
    expect(secondsLeft(1_000_000, 1_000_000 + 59_500)).toBe(1);
    expect(secondsLeft(1_000_000, 1_000_000 + 60_000)).toBe(0);
    expect(secondsLeft(null, 5)).toBe(0);
  });
});

describe("profile name", () => {
  it("requires a name of at most 100 characters", () => {
    expect(profileSchema.safeParse({ fullName: "   " }).success).toBe(false);
    expect(profileSchema.safeParse({ fullName: "a".repeat(101) }).success).toBe(false);
    expect(profileSchema.parse({ fullName: "  Muhammed Affan " }).fullName).toBe("Muhammed Affan");
  });
});

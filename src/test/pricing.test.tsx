import { describe, expect, it } from "vitest";
import { calcTotals } from "@/lib/pricing";

describe("order pricing", () => {
  it("charges ₹99 delivery below ₹999", () => {
    expect(calcTotals(500)).toEqual({ subtotal: 500, delivery: 99, total: 599 });
  });
  it("gives free delivery at ₹999 and above", () => {
    expect(calcTotals(999).delivery).toBe(0);
  });
  it("charges nothing for an empty cart", () => {
    expect(calcTotals(0).total).toBe(0);
  });
});

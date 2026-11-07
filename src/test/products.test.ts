import { describe, expect, it } from "vitest";
import { filterProducts, products, sortProducts, discountPct } from "@/data/products";

describe("catalog", () => {
  it("has at least 15 products across all 7 categories", () => {
    expect(products.length).toBeGreaterThanOrEqual(15);
    expect(new Set(products.map((p) => p.category)).size).toBe(7);
  });
  it("sorts by price low to high", () => {
    const s = sortProducts(products, "price-asc").map((p) => p.price);
    expect(s[0]).toBe(Math.min(...s));
    expect(s[s.length - 1]).toBe(Math.max(...s));
  });
  it("sorts by price high to low", () => {
    const s = sortProducts(products, "price-desc").map((p) => p.price);
    expect(s[0]).toBe(Math.max(...s));
  });
  it("filters by category and search term", () => {
    expect(filterProducts(undefined, "laptops").every((p) => p.category === "laptops")).toBe(true);
    expect(filterProducts("sonic").map((p) => p.brand)).toEqual(["Sonic", "Sonic", "Sonic"]);
  });
  it("computes discount percentage", () => {
    expect(discountPct({ ...products[0]!, price: 75, mrp: 100 })).toBe(25);
  });
});

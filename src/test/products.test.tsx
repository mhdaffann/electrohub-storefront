import { describe, expect, it } from "vitest";
import { discountPct, filterProducts, formatINR, sortProducts } from "@/data/products";
import { toCatalog, type CategoryRow, type ProductRow } from "@/lib/catalog-map";

const images = { smartphones: "/phone.jpg", laptops: "/laptop.jpg" };

const categoryRows: CategoryRow[] = [
  { slug: "smartphones", name: "Smartphones", image_key: "smartphones", image_url: null },
  { slug: "laptops", name: "Laptops", image_key: "laptops", image_url: "https://cdn.example.com/laptops.jpg" },
];

const row = (over: Partial<ProductRow>): ProductRow => ({
  id: "x", category_slug: "smartphones", name: "Phone", brand: "Brand", price: 1000, mrp: 1000,
  rating: "4.5", review_count: 10, description: "", highlights: [], tags: [], image_key: "", image_url: null,
  ...over,
});

const productRows: ProductRow[] = [
  row({ id: "nova", name: "Nova X", brand: "Nova", price: 49999, mrp: 59999, tags: ["trending", "unknown"] }),
  row({ id: "zen", category_slug: "laptops", name: "ZenBook Air", brand: "Zen", price: 89999, mrp: 99999, image_key: "laptops" }),
  row({ id: "lite", name: "Nova Lite", brand: "Nova", price: 14999, mrp: 17999 }),
];

const { categories, products } = toCatalog({ categories: categoryRows, products: productRows }, images);

describe("catalog mapping from database rows", () => {
  it("maps product columns to the shapes the store uses", () => {
    const nova = products[0]!;
    expect(nova).toMatchObject({ id: "nova", category: "smartphones", price: 49999, mrp: 59999, rating: 4.5, reviews: 10 });
    expect(nova.tags).toEqual(["trending"]);
  });
  it("prefers an uploaded image URL over a bundled image", () => {
    expect(categories[1]!.image).toBe("https://cdn.example.com/laptops.jpg");
    expect(categories[0]!.image).toBe("/phone.jpg");
    expect(products[0]!.image).toBe("/phone.jpg");
  });
});

describe("catalog helpers", () => {
  it("sorts by price low to high", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.price)).toEqual([14999, 49999, 89999]);
  });
  it("sorts by price high to low", () => {
    expect(sortProducts(products, "price-desc").map((p) => p.price)).toEqual([89999, 49999, 14999]);
  });
  it("keeps catalog order for featured", () => {
    expect(sortProducts(products, "featured").map((p) => p.id)).toEqual(["nova", "zen", "lite"]);
  });
  it("filters by category and search term", () => {
    expect(filterProducts(products, undefined, "laptops").map((p) => p.id)).toEqual(["zen"]);
    expect(filterProducts(products, "nova").map((p) => p.id)).toEqual(["nova", "lite"]);
    expect(filterProducts(products, "nova", "laptops")).toEqual([]);
  });
  it("computes discount percentage", () => {
    expect(discountPct({ price: 75, mrp: 100 })).toBe(25);
    expect(discountPct({ price: 0, mrp: 0 })).toBe(0);
  });
  it("formats prices in rupees", () => {
    expect(formatINR(49999)).toBe("₹49,999");
  });
});

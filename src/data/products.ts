// Catalog types and pure helpers. Products and categories are stored in the
// database and loaded through `src/lib/catalog.ts`.
export type CategorySlug = string;
export type ProductTag = "trending" | "bestseller" | "offer";

export interface Category { slug: CategorySlug; name: string; image: string }
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  price: number; // INR, selling price
  mrp: number; // INR, original price
  rating: number;
  reviews: number;
  image: string;
  description: string;
  highlights: string[];
  tags: ProductTag[];
}

export type SortOption = "featured" | "price-asc" | "price-desc";

/** Returns a new array; "featured" keeps catalog order. */
export function sortProducts(list: Product[], sort?: string) {
  if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  return [...list];
}

export const discountPct = (p: Pick<Product, "price" | "mrp">) => (p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function filterProducts(list: Product[], q?: string, category?: string) {
  const term = q?.trim().toLowerCase();
  return list.filter(
    (p) =>
      (!category || p.category === category) &&
      (!term || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term)),
  );
}

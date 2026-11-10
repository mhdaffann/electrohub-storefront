import type { Category, Product, ProductTag } from "@/data/products";

export interface CategoryRow { slug: string; name: string; image_key: string; image_url: string | null }
export interface ProductRow {
  id: string; category_slug: string; name: string; brand: string; price: number; mrp: number;
  rating: number | string; review_count: number; description: string; highlights: string[];
  tags: string[]; image_key: string; image_url: string | null;
}
export interface Catalog { categories: Category[]; products: Product[] }

const TAGS: ProductTag[] = ["trending", "bestseller", "offer"];

/** Maps database rows to the shapes the UI uses. An `image_url` wins over a bundled `image_key`. */
export function toCatalog(rows: { categories: CategoryRow[]; products: ProductRow[] }, images: Record<string, string>): Catalog {
  const pick = (url: string | null, key: string) => url || images[key] || images[Object.keys(images)[0] ?? ""] || "";
  return {
    categories: rows.categories.map((c) => ({ slug: c.slug, name: c.name, image: pick(c.image_url, c.image_key) })),
    products: rows.products.map((p) => ({
      id: p.id, name: p.name, brand: p.brand, category: p.category_slug, price: p.price, mrp: p.mrp,
      rating: Number(p.rating), reviews: p.review_count, description: p.description, highlights: p.highlights ?? [],
      tags: (p.tags ?? []).filter((t): t is ProductTag => (TAGS as string[]).includes(t)),
      image: pick(p.image_url, p.image_key || p.category_slug),
    })),
  };
}

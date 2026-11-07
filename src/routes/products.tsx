import { createFileRoute, Link } from "@tanstack/react-router";
import { categories, filterProducts, getCategory } from "@/data/products";
import { ProductGrid } from "@/components/site/ProductCard";

type Search = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Electronics — ElectroHub" },
      { name: "description", content: "Browse and filter smartphones, laptops, audio, cameras and gaming accessories." },
      { property: "og:title", content: "Shop All Electronics — ElectroHub" },
      { property: "og:description", content: "Search and filter the full ElectroHub catalog." },
    ],
  }),
  component: Products,
});

function Products() {
  const { q, category } = Route.useSearch();
  const list = filterProducts(q, category);
  const cat = category ? getCategory(category) : undefined;
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-foreground"}`;

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">{cat ? cat.name : "All products"}</h1>
      <p className="mt-1 text-muted-foreground">
        {q ? <>Results for "<span className="font-semibold text-foreground">{q}</span>" · </> : null}
        {list.length} item{list.length === 1 ? "" : "s"}
      </p>
      <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2">
        <Link to="/products" search={{ q }} className={chip(!category)}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} to="/products" search={{ q, category: c.slug }} className={chip(category === c.slug)}>{c.name}</Link>
        ))}
      </div>
      <div className="mt-6">
        {list.length ? <ProductGrid products={list} /> : (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <p className="font-semibold">No products found.</p>
            <Link to="/products" className="mt-3 inline-block text-sm font-semibold text-primary">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}

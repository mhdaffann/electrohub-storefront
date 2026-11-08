import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { categories, filterProducts, getCategory, sortProducts } from "@/data/products";
import { ProductGrid } from "@/components/site/ProductCard";

type SearchParams = { q?: string | undefined; category?: string | undefined; sort?: string | undefined };
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: str(s["q"]),
    category: str(s["category"]),
    sort: str(s["sort"]),
  }),
  head: () => ({
    meta: [
      { title: "Shop All Electronics — ElectroHub" },
      { name: "description", content: "Browse, search, filter and sort smartphones, laptops, audio, cameras and gaming accessories." },
      { property: "og:title", content: "Shop All Electronics — ElectroHub" },
      { property: "og:description", content: "Search, filter and sort the full ElectroHub catalog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Products,
});

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function Products() {
  const { q, category, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const [term, setTerm] = useState(q ?? "");
  useEffect(() => setTerm(q ?? ""), [q]);

  const list = sortProducts(filterProducts(q, category), sort);
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); navigate({ search: (prev) => ({ ...prev, q: term.trim() || undefined }) }); }}
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-24 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">Search</button>
        </form>
        <select
          value={sort ?? "featured"}
          onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value === "featured" ? undefined : e.target.value }) })}
          aria-label="Sort products"
          className="h-11 rounded-full border border-input bg-card px-4 text-sm font-semibold outline-none focus:border-primary"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
        <Link to="/products" search={{ q, sort }} className={chip(!category)}>All</Link>
        {categories.map((c) => (
          <Link key={c.slug} to="/products" search={{ q, sort, category: c.slug }} className={chip(category === c.slug)}>{c.name}</Link>
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

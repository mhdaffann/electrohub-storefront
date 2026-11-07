import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { discountPct, formatINR, getCategory, getProduct, products } from "@/data/products";
import { ProductGrid, Rating } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — ElectroHub` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — ElectroHub` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:type", content: "product" },
        ]
      : [{ title: "Product not found — ElectroHub" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-x py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block font-semibold text-primary">Browse products</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const cat = getCategory(product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
        <Link to="/products" search={{ category: product.category }} className="hover:text-foreground">{cat?.name}</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border bg-secondary">
          <img src={product.image} alt={product.name} width={816} height={816} className="aspect-square w-full object-cover" />
        </div>
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <Rating value={product.rating} reviews={product.reviews} />
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold">{formatINR(product.price)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-sm font-bold text-success">{discountPct(product)}% off</span>
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
          <p className="text-foreground/85">{product.description}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{h}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center rounded-full border bg-card">
              <button className="h-11 w-11 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="h-11 w-11 text-lg" onClick={() => setQty(qty + 1)} aria-label="Increase">+</button>
            </div>
            <button
              onClick={() => { add(product.id, qty); toast.success("Added to cart"); }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lift transition hover:brightness-110 sm:flex-none"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

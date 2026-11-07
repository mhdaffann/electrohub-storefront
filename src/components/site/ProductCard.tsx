import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { discountPct, formatINR, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-star text-star" : "text-border"}`} />
        ))}
      </div>
      <span className="font-semibold">{value.toFixed(1)}</span>
      {reviews !== undefined && <span className="text-muted-foreground">({reviews.toLocaleString("en-IN")})</span>}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = discountPct(product);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-secondary">
        <img src={product.image} alt={product.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {off > 0 && <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">{off}% OFF</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug">{product.name}</h3>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatINR(product.price)}</span>
          <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp)}</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => { add(product.id); toast.success(`${product.name} added to cart`); }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
          <Link to="/product/$id" params={{ id: product.id }} className="inline-flex items-center justify-center rounded-full border px-3 py-2.5 text-sm font-semibold transition hover:border-foreground">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

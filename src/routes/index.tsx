import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, ShieldCheck, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { categories, products, discountPct, formatINR } from "@/data/products";
import { ProductGrid, Rating, SectionHeading } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ElectroHub — Premium Electronics Store in India" },
      { name: "description", content: "Shop smartphones, laptops, headphones, smartwatches, cameras and more at the best prices in ₹." },
      { property: "og:title", content: "ElectroHub — Premium Electronics Store" },
      { property: "og:description", content: "Latest gadgets with great deals, genuine warranty and fast delivery." },
    ],
  }),
  component: Index,
});

const reviews = [
  { name: "Aarav Sharma", city: "Bengaluru", rating: 5, text: "Got my AeroBook in two days. Genuine product, perfectly packed. Best price I found online." },
  { name: "Priya Nair", city: "Kochi", rating: 5, text: "The SonicMax headphones are incredible. Smooth checkout and helpful support team." },
  { name: "Rohan Mehta", city: "Pune", rating: 4, text: "Great offers on gaming gear. The controller feels premium. Will shop again!" },
];

function Index() {
  const trending = products.filter((p) => p.tags.includes("trending")).slice(0, 4);
  const best = products.filter((p) => p.tags.includes("bestseller")).slice(0, 4);
  const offers = products.filter((p) => p.tags.includes("offer")).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero text-ink-foreground">
        <div className="container-x grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-ink-foreground/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">New season tech</span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">The future of tech,<br /> delivered today.</h1>
            <p className="max-w-md text-lg opacity-75">Flagship phones, ultralight laptops and immersive audio — up to 40% off this week.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lift transition hover:brightness-110">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products" search={{ category: "smartphones" }} className="rounded-full border border-ink-foreground/25 px-6 py-3.5 font-semibold transition hover:bg-ink-foreground/10">Explore phones</Link>
            </div>
          </div>
          <img src={hero} alt="Smartphone, headphones and smartwatch" width={1600} height={912} className="w-full rounded-3xl" />
        </div>
      </section>

      <div className="container-x grid grid-cols-1 gap-3 py-6 text-sm sm:grid-cols-3">
        {[[Truck, "Free delivery over ₹999"], [ShieldCheck, "Genuine brand warranty"], [BadgePercent, "No-cost EMI available"]].map(([Icon, t]) => {
          const I = Icon as typeof Truck;
          return <div key={t as string} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card"><I className="h-5 w-5 text-primary" /><span className="font-semibold">{t as string}</span></div>;
        })}
      </div>

      {/* Categories */}
      <section className="container-x mt-10">
        <SectionHeading title="Shop by category" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <Link key={c.slug} to="/products" search={{ category: c.slug }} className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-3 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="aspect-square w-full rounded-xl object-cover transition group-hover:scale-105" />
              <span className="text-xs font-semibold sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x mt-16">
        <SectionHeading title="Trending now" subtitle="What everyone's adding to cart" action={<Link to="/products" className="text-sm font-semibold text-primary">View all →</Link>} />
        <ProductGrid products={trending} />
      </section>

      <section className="container-x mt-16">
        <SectionHeading title="Best sellers" subtitle="Loved by thousands of customers" />
        <ProductGrid products={best} />
      </section>

      {/* Offers */}
      <section className="container-x mt-16">
        <div className="rounded-3xl bg-ink p-6 text-ink-foreground sm:p-10">
          <SectionHeading title="Special offers" subtitle="Limited-time deals. Grab them before they're gone." />
          <div className="grid gap-4 md:grid-cols-3">
            {offers.map((p) => (
              <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group flex items-center gap-4 rounded-2xl bg-ink-foreground/5 p-4 transition hover:bg-ink-foreground/10">
                <img src={p.image} alt={p.name} loading="lazy" width={816} height={816} className="h-24 w-24 rounded-xl object-cover" />
                <div>
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">{discountPct(p)}% OFF</span>
                  <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary">{p.name}</h3>
                  <p className="mt-1 font-bold">{formatINR(p.price)} <span className="text-sm font-normal line-through opacity-50">{formatINR(p.mrp)}</span></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x mt-16">
        <SectionHeading title="What customers say" />
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-2xl border bg-card p-6 shadow-card">
              <Rating value={r.rating} />
              <blockquote className="mt-3 text-foreground/85">"{r.text}"</blockquote>
              <figcaption className="mt-4 text-sm"><span className="font-semibold">{r.name}</span> <span className="text-muted-foreground">· {r.city}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

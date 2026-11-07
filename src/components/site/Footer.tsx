import { Link } from "@tanstack/react-router";
import { categories } from "@/data/products";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm opacity-70">Premium electronics, genuine warranty and fast delivery across India.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm opacity-70">
            {categories.map((c) => (
              <li key={c.slug}><Link to="/products" search={{ category: c.slug }} className="hover:opacity-100">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Help</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li>Shipping & delivery</li><li>Returns & refunds</li><li>Warranty</li><li>Contact us</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Why ElectroHub</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li>100% genuine products</li><li>Free delivery over ₹999</li><li>7-day easy returns</li><li>No-cost EMI options</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-5 text-center text-xs opacity-60">© {new Date().getFullYear()} ElectroHub. All rights reserved.</div>
    </footer>
  );
}

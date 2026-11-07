import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { categories } from "@/data/products";
import { useCart } from "@/lib/cart";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Zap className="h-5 w-5" fill="currentColor" />
      </span>
      Electro<span className="text-primary">Hub</span>
    </Link>
  );
}

function SearchBox({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined } });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search phones, laptops, headphones…"
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-input bg-secondary pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
      />
    </form>
  );
}

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center gap-4">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Logo />
        <div className="mx-4 hidden flex-1 md:block"><SearchBox /></div>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-secondary sm:inline-flex">Login</Link>
          <Link to="/signup" className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground transition hover:opacity-90 sm:inline-flex">Sign up</Link>
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{count}</span>
            )}
          </Link>
        </div>
      </div>
      <div className="container-x pb-3 md:hidden"><SearchBox /></div>
      <nav className="container-x hidden gap-6 overflow-x-auto pb-3 text-sm font-medium text-muted-foreground lg:flex">
        {categories.map((c) => (
          <Link key={c.slug} to="/products" search={{ category: c.slug }} className="whitespace-nowrap transition hover:text-primary">{c.name}</Link>
        ))}
      </nav>
      {open && (
        <div className="border-t bg-card lg:hidden">
          <div className="container-x flex flex-col py-3">
            {categories.map((c) => (
              <Link key={c.slug} to="/products" search={{ category: c.slug }} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 font-medium hover:bg-secondary">{c.name}</Link>
            ))}
            <div className="mt-3 flex gap-2 border-t pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border py-2.5 text-center text-sm font-semibold">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-ink-foreground">Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Sample catalog. Shape mirrors a future `products` table so it can be swapped
// for a database query without changing components.
import smartphones from "@/assets/smartphones.jpg";
import laptops from "@/assets/laptops.jpg";
import headphones from "@/assets/headphones.jpg";
import smartwatches from "@/assets/smartwatches.jpg";
import cameras from "@/assets/cameras.jpg";
import speakers from "@/assets/speakers.jpg";
import gaming from "@/assets/gaming.jpg";

export type CategorySlug =
  | "smartphones" | "laptops" | "headphones" | "smartwatches" | "cameras" | "speakers" | "gaming";

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
  tags: ("trending" | "bestseller" | "offer")[];
}

export const categories: Category[] = [
  { slug: "smartphones", name: "Smartphones", image: smartphones },
  { slug: "laptops", name: "Laptops", image: laptops },
  { slug: "headphones", name: "Headphones", image: headphones },
  { slug: "smartwatches", name: "Smartwatches", image: smartwatches },
  { slug: "cameras", name: "Cameras", image: cameras },
  { slug: "speakers", name: "Speakers", image: speakers },
  { slug: "gaming", name: "Gaming Accessories", image: gaming },
];

const img = (c: CategorySlug) => categories.find((x) => x.slug === c)!.image;

const p = (
  id: string, name: string, brand: string, category: CategorySlug, price: number, mrp: number,
  rating: number, reviews: number, tags: Product["tags"], description: string, highlights: string[],
): Product => ({ id, name, brand, category, price, mrp, rating, reviews, tags, description, highlights, image: img(category) });

export const products: Product[] = [
  p("nova-x-pro", "Nova X Pro 5G (256GB)", "Nova", "smartphones", 89999, 109999, 4.7, 2841, ["trending", "bestseller"], "Titanium flagship with a 6.7\" ProMotion display, triple 48MP cameras and all-day battery.", ["6.7\" 120Hz OLED", "48MP triple camera", "5000mAh battery", "256GB storage"]),
  p("pixelone-8", "PixelOne 8 (128GB)", "PixelOne", "smartphones", 54999, 64999, 4.5, 1320, ["offer"], "Clean software, brilliant computational photography and seven years of updates.", ["6.2\" OLED", "50MP camera", "AI photo editing", "7 years updates"]),
  p("aero-book-14", "AeroBook 14 Ultra", "Aero", "laptops", 124990, 149990, 4.8, 964, ["trending", "bestseller"], "Featherlight 14\" laptop with an 18-hour battery and a stunning 3K display.", ["Intel Core Ultra 7", "16GB RAM / 1TB SSD", "3K 120Hz display", "1.2 kg"]),
  p("stratos-16", "Stratos 16 Creator", "Stratos", "laptops", 179990, 199990, 4.6, 412, ["offer"], "Workstation power for creators with RTX graphics and a colour-accurate panel.", ["RTX 4070 GPU", "32GB RAM", "16\" Mini-LED", "Thunderbolt 4"]),
  p("sonic-max", "SonicMax ANC Headphones", "Sonic", "headphones", 24990, 34990, 4.7, 5102, ["trending", "bestseller", "offer"], "Industry-leading noise cancellation with 40 hours of rich, detailed sound.", ["Adaptive ANC", "40h battery", "Hi-Res audio", "Multipoint"]),
  p("sonic-buds", "SonicBuds Pro", "Sonic", "headphones", 12990, 17990, 4.4, 2210, ["bestseller"], "Pocket-sized earbuds with spatial audio and wireless charging.", ["Spatial audio", "ANC", "IPX4", "Wireless case"]),
  p("pulse-watch-3", "Pulse Watch 3", "Pulse", "smartwatches", 29990, 36990, 4.6, 1873, ["trending"], "Health tracking, GPS and an always-on AMOLED display in an aluminium case.", ["ECG & SpO2", "Built-in GPS", "7-day battery", "5ATM"]),
  p("pulse-fit", "Pulse Fit Lite", "Pulse", "smartwatches", 4999, 7999, 4.2, 6340, ["offer", "bestseller"], "Everyday fitness watch with 100+ workout modes.", ["1.8\" AMOLED", "100+ sports", "14-day battery", "Bluetooth calling"]),
  p("lumen-z6", "Lumen Z6 Mirrorless Kit", "Lumen", "cameras", 159990, 184990, 4.8, 387, ["trending"], "Full-frame 24MP mirrorless with 4K60 video and in-body stabilisation.", ["24MP full-frame", "4K60 10-bit", "5-axis IBIS", "24-70mm kit lens"]),
  p("lumen-go", "Lumen Go Vlog Camera", "Lumen", "cameras", 42990, 49990, 4.3, 521, ["offer"], "Compact vlogging camera with flip screen and directional mic.", ["1\" sensor", "4K video", "Flip screen", "Vlog mic"]),
  p("boom-360", "Boom 360 Speaker", "Boom", "speakers", 9990, 14990, 4.5, 3120, ["bestseller", "offer"], "360° sound, deep bass and a rugged waterproof body.", ["360° audio", "IP67", "20h playtime", "PartyLink"]),
  p("boom-home", "Boom Home Smart Speaker", "Boom", "speakers", 19990, 24990, 4.4, 890, ["trending"], "Room-filling smart speaker with voice assistant and Wi-Fi streaming.", ["Wi-Fi + Bluetooth", "Voice assistant", "Room tuning", "Multi-room"]),
  p("vortex-pad", "Vortex Wireless Controller", "Vortex", "gaming", 5490, 6990, 4.6, 4210, ["bestseller", "trending"], "Low-latency controller with hall-effect sticks and haptics.", ["Hall-effect sticks", "Haptic triggers", "30h battery", "PC & console"]),
  p("vortex-keys", "Vortex RGB Mechanical Keyboard", "Vortex", "gaming", 7990, 11990, 4.5, 1650, ["offer"], "Hot-swappable mechanical keyboard with per-key RGB.", ["Hot-swap switches", "Per-key RGB", "Aluminium frame", "USB-C"]),
];

export const discountPct = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);
export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
export const getProduct = (id: string) => products.find((x) => x.id === id);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export function filterProducts(q?: string, category?: string) {
  const term = q?.trim().toLowerCase();
  return products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!term || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term)),
  );
}

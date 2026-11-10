CREATE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 NEW.updated_at = now();
 RETURN NEW;
END;
$$;

CREATE TABLE public.categories (
 slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9-]{1,60}$'),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
 image_key text NOT NULL DEFAULT '',
 image_url text,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.products (
 id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{1,80}$'),
 category_slug text NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
 brand text NOT NULL DEFAULT '' CHECK (char_length(brand) <= 80),
 price integer NOT NULL CHECK (price > 0),
 mrp integer NOT NULL,
 rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
 review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
 description text NOT NULL DEFAULT '',
 highlights text[] NOT NULL DEFAULT '{}',
 tags text[] NOT NULL DEFAULT '{}' CHECK (tags <@ ARRAY['trending','bestseller','offer']::text[]),
 image_key text NOT NULL DEFAULT '',
 image_url text,
 is_active boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT products_mrp_at_least_price CHECK (mrp >= price)
);
CREATE INDEX products_category_idx ON public.products (category_slug);
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled','refunded')),
 subtotal integer NOT NULL CHECK (subtotal >= 0),
 delivery_charge integer NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
 total integer NOT NULL CHECK (total >= 0),
 currency text NOT NULL DEFAULT 'INR',
 shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
 payment_reference text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders (user_id, created_at DESC);
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TABLE public.order_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
 product_id text REFERENCES public.products(id) ON DELETE SET NULL,
 product_name text NOT NULL,
 unit_price integer NOT NULL CHECK (unit_price >= 0),
 quantity integer NOT NULL CHECK (quantity > 0),
 line_total integer GENERATED ALWAYS AS (unit_price * quantity) STORED,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items (order_id);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())));

INSERT INTO public.categories (slug, name, image_key, sort_order) VALUES
('smartphones', 'Smartphones', 'smartphones', 1),
('laptops', 'Laptops', 'laptops', 2),
('headphones', 'Headphones', 'headphones', 3),
('smartwatches', 'Smartwatches', 'smartwatches', 4),
('cameras', 'Cameras', 'cameras', 5),
('speakers', 'Speakers', 'speakers', 6),
('gaming', 'Gaming Accessories', 'gaming', 7);

INSERT INTO public.products (id, category_slug, name, brand, price, mrp, rating, review_count, description, highlights, tags, image_key, sort_order) VALUES
('nova-x-pro', 'smartphones', 'Nova X Pro 5G (256GB)', 'Nova', 89999, 109999, 4.7, 2841, 'Titanium flagship with a 6.7" ProMotion display, triple 48MP cameras and all-day battery.', ARRAY['6.7" 120Hz OLED','48MP triple camera','5000mAh battery','256GB storage']::text[], ARRAY['trending','bestseller']::text[], 'smartphones', 1),
('pixelone-8', 'smartphones', 'PixelOne 8 (128GB)', 'PixelOne', 54999, 64999, 4.5, 1320, 'Clean software, brilliant computational photography and seven years of updates.', ARRAY['6.2" OLED','50MP camera','AI photo editing','7 years updates']::text[], ARRAY['offer']::text[], 'smartphones', 2),
('aero-book-14', 'laptops', 'AeroBook 14 Ultra', 'Aero', 124990, 149990, 4.8, 964, 'Featherlight 14" laptop with an 18-hour battery and a stunning 3K display.', ARRAY['Intel Core Ultra 7','16GB RAM / 1TB SSD','3K 120Hz display','1.2 kg']::text[], ARRAY['trending','bestseller']::text[], 'laptops', 3),
('stratos-16', 'laptops', 'Stratos 16 Creator', 'Stratos', 179990, 199990, 4.6, 412, 'Workstation power for creators with RTX graphics and a colour-accurate panel.', ARRAY['RTX 4070 GPU','32GB RAM','16" Mini-LED','Thunderbolt 4']::text[], ARRAY['offer']::text[], 'laptops', 4),
('sonic-max', 'headphones', 'SonicMax ANC Headphones', 'Sonic', 24990, 34990, 4.7, 5102, 'Industry-leading noise cancellation with 40 hours of rich, detailed sound.', ARRAY['Adaptive ANC','40h battery','Hi-Res audio','Multipoint']::text[], ARRAY['trending','bestseller','offer']::text[], 'headphones', 5),
('sonic-buds', 'headphones', 'SonicBuds Pro', 'Sonic', 12990, 17990, 4.4, 2210, 'Pocket-sized earbuds with spatial audio and wireless charging.', ARRAY['Spatial audio','ANC','IPX4','Wireless case']::text[], ARRAY['bestseller']::text[], 'headphones', 6),
('pulse-watch-3', 'smartwatches', 'Pulse Watch 3', 'Pulse', 29990, 36990, 4.6, 1873, 'Health tracking, GPS and an always-on AMOLED display in an aluminium case.', ARRAY['ECG & SpO2','Built-in GPS','7-day battery','5ATM']::text[], ARRAY['trending']::text[], 'smartwatches', 7),
('pulse-fit', 'smartwatches', 'Pulse Fit Lite', 'Pulse', 4999, 7999, 4.2, 6340, 'Everyday fitness watch with 100+ workout modes.', ARRAY['1.8" AMOLED','100+ sports','14-day battery','Bluetooth calling']::text[], ARRAY['offer','bestseller']::text[], 'smartwatches', 8),
('lumen-z6', 'cameras', 'Lumen Z6 Mirrorless Kit', 'Lumen', 159990, 184990, 4.8, 387, 'Full-frame 24MP mirrorless with 4K60 video and in-body stabilisation.', ARRAY['24MP full-frame','4K60 10-bit','5-axis IBIS','24-70mm kit lens']::text[], ARRAY['trending']::text[], 'cameras', 9),
('lumen-go', 'cameras', 'Lumen Go Vlog Camera', 'Lumen', 42990, 49990, 4.3, 521, 'Compact vlogging camera with flip screen and directional mic.', ARRAY['1" sensor','4K video','Flip screen','Vlog mic']::text[], ARRAY['offer']::text[], 'cameras', 10),
('boom-360', 'speakers', 'Boom 360 Speaker', 'Boom', 9990, 14990, 4.5, 3120, '360° sound, deep bass and a rugged waterproof body.', ARRAY['360° audio','IP67','20h playtime','PartyLink']::text[], ARRAY['bestseller','offer']::text[], 'speakers', 11),
('boom-home', 'speakers', 'Boom Home Smart Speaker', 'Boom', 19990, 24990, 4.4, 890, 'Room-filling smart speaker with voice assistant and Wi-Fi streaming.', ARRAY['Wi-Fi + Bluetooth','Voice assistant','Room tuning','Multi-room']::text[], ARRAY['trending']::text[], 'speakers', 12),
('vortex-pad', 'gaming', 'Vortex Wireless Controller', 'Vortex', 5490, 6990, 4.6, 4210, 'Low-latency controller with hall-effect sticks and haptics.', ARRAY['Hall-effect sticks','Haptic triggers','30h battery','PC & console']::text[], ARRAY['bestseller','trending']::text[], 'gaming', 13),
('vortex-keys', 'gaming', 'Vortex RGB Mechanical Keyboard', 'Vortex', 7990, 11990, 4.5, 1650, 'Hot-swappable mechanical keyboard with per-key RGB.', ARRAY['Hot-swap switches','Per-key RGB','Aluminium frame','USB-C']::text[], ARRAY['offer']::text[], 'gaming', 14),
('nova-lite', 'smartphones', 'Nova Lite 5G (128GB)', 'Nova', 18999, 24999, 4.3, 3980, 'Big battery, smooth 120Hz screen and 5G at a budget-friendly price.', ARRAY['6.6" 120Hz LCD','50MP camera','6000mAh battery','5G ready']::text[], ARRAY['offer']::text[], 'smartphones', 15),
('sonic-neck', 'headphones', 'SonicBand Neckband', 'Sonic', 1999, 3499, 4.1, 8120, 'Lightweight neckband earphones with fast charging for daily commutes.', ARRAY['25h playtime','Fast charge','Magnetic buds','IPX5']::text[], ARRAY['bestseller']::text[], 'headphones', 16),
('vortex-headset', 'gaming', 'Vortex 7.1 Gaming Headset', 'Vortex', 4490, 6490, 4.4, 2380, 'Surround sound headset with a detachable noise-cancelling mic.', ARRAY['7.1 surround','50mm drivers','Detachable mic','Memory foam']::text[], ARRAY['trending']::text[], 'gaming', 17);
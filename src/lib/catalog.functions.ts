import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public catalog read with the publishable key; access is limited by read-only database policies.
export const getCatalogRows = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("The store catalog is not configured.");
  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("slug, name, image_key, image_url").order("sort_order"),
    supabase.from("products").select("id, category_slug, name, brand, price, mrp, rating, review_count, description, highlights, tags, image_key, image_url").order("sort_order"),
  ]);
  if (categories.error) throw new Error(`Could not load categories: ${categories.error.message}`);
  if (products.error) throw new Error(`Could not load products: ${products.error.message}`);
  return { categories: categories.data, products: products.data };
});

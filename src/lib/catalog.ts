import { queryOptions } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { catalogImages } from "@/lib/catalog-images";
import { toCatalog } from "@/lib/catalog-map";
import { getCatalogRows } from "@/lib/catalog.functions";

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: async () => toCatalog(await getCatalogRows(), catalogImages),
  staleTime: 5 * 60_000,
});

const rootRoute = getRouteApi("__root__");

/** Catalog loaded by the root route, with lookup helpers. */
export function useCatalog() {
  const catalog = rootRoute.useLoaderData();
  return useMemo(() => {
    const byId = new Map(catalog.products.map((p) => [p.id, p]));
    const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
    return { ...catalog, getProduct: (id: string) => byId.get(id), getCategory: (slug: string) => bySlug.get(slug) };
  }, [catalog]);
}

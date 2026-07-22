import type { HttpTypes } from "@medusajs/types";

// Locale-aware display fields. Core product/category fields are English; the
// Vietnamese label rides in metadata (title_vi on products, name_vi on
// categories) until the storefronts adopt a translation layer.

export function localizedTitle(
  product: HttpTypes.StoreProduct,
  locale: string
): string {
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  if (locale === "vi" && typeof meta.title_vi === "string") return meta.title_vi;
  return product.title ?? "";
}

// Taken off the product rather than named directly: HttpTypes exports the
// category shape a product embeds only through this field.
type ProductCategory = NonNullable<HttpTypes.StoreProduct["categories"]>[number];

// The single place that resolves a category's display name. Card eyebrows, the
// listing chips and the home strip all read through here, so no copy of the
// metadata lookup can drift from the others.
export function localizedCategoryName(
  category: ProductCategory,
  locale: string
): string {
  const meta = (category.metadata ?? {}) as Record<string, unknown>;
  if (locale === "vi" && typeof meta.name_vi === "string") return meta.name_vi;
  return category.name ?? "";
}

export function categoryLabel(
  product: HttpTypes.StoreProduct,
  locale: string
): string | undefined {
  const cat = product.categories?.[0];
  return cat ? localizedCategoryName(cat, locale) : undefined;
}

// A category as the UI addresses it: by HANDLE, never by id. Ids are reseeded
// with the catalog, handles are authored, and a filter link that a customer
// shares has to survive a reseed.
export type CatalogCategory = { handle: string; label: string };

// The distinct categories present in a product list. Ordered by the catalog's
// own rank so the home strip and the listing chips cannot disagree on order.
export function catalogCategories(
  products: HttpTypes.StoreProduct[],
  locale: string
): CatalogCategory[] {
  const seen = new Map<string, { rank: number; label: string }>();
  for (const product of products) {
    for (const category of product.categories ?? []) {
      if (!category.handle || seen.has(category.handle)) continue;
      seen.set(category.handle, {
        rank: category.rank ?? 0,
        label: localizedCategoryName(category, locale),
      });
    }
  }
  return [...seen.entries()]
    .sort(([, a], [, b]) => a.rank - b.rank)
    .map(([handle, { label }]) => ({ handle, label }));
}

// The listing filter's URL contract, written by the home strip and read by the
// listing. Object form rather than a template string so the locale-aware Link
// cannot drop the query while it prefixes the pathname.
export const CATEGORY_PARAM = "category";

export function categoryHref(handle: string | null) {
  return handle
    ? { pathname: "/products", query: { [CATEGORY_PARAM]: handle } }
    : { pathname: "/products" };
}

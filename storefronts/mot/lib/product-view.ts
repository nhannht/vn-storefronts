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

// The book's opening lines for the reading preview, locale-aware like the title:
// vi -> metadata.excerpt_vi, otherwise metadata.excerpt_en. undefined when the
// book carries no excerpt, so the PDP can drop the section cleanly. Verse
// excerpts (Kiều) keep their newlines - the preview renders them with
// white-space: pre-line so each line stays a line.
export function localizedExcerpt(
  product: HttpTypes.StoreProduct,
  locale: string
): string | undefined {
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  if (locale === "vi" && typeof meta.excerpt_vi === "string") {
    return meta.excerpt_vi;
  }
  if (typeof meta.excerpt_en === "string") return meta.excerpt_en;
  return undefined;
}

// The translator as this module needs it. next-intl types the key against the
// namespace's literal keys; an axis key is only known at runtime, so the shape
// is restated here and `has` is what makes the lookup safe.
type AxisTranslator = {
  (key: string): string;
  has(key: string): boolean;
};

// A binding value ("Softcover" / "Hardcover", the Cover option value) localized
// by message lookup, falling back to the raw value for a binding the catalog
// carries but the messages do not - the same by-lookup contract as axisLabel.
// The PDP edition picker and the cart line both read through here so the two can
// never print a different word for the same edition.
export function localizedBinding(
  t: AxisTranslator,
  value: string | null | undefined
): string {
  const key = (value ?? "").trim().toLowerCase();
  return key && t.has(key) ? t(key) : value ?? "";
}

// A variant axis title is a core (English) product field - "Storage", "Color",
// "Connector" - and the catalogs key its label off the lowercased title. Deriving
// the key means a new axis is a message-catalog edit and never a code edit, and
// an axis the catalogs do not carry falls back to its core title instead of
// rendering a bare key. The PDP's variant controls and its spec table both read
// through here so the two can never disagree about an axis.
export function axisLabel(
  t: AxisTranslator,
  title: string | null | undefined
): string {
  const raw = title ?? "";
  const key = raw.trim().toLowerCase();
  return key && t.has(key) ? t(key) : raw;
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

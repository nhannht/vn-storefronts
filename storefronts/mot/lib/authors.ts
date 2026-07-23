import type { HttpTypes } from "@medusajs/types";

// The author browse contract. mot has no product images and no categories: the
// catalog's one organizing axis is the AUTHOR, carried in metadata.author. This
// module is the single source of truth for turning an author name into a URL
// slug, so the nav, the listing chips and the home strip cannot disagree on
// what "nguyen-du" means. Mirrors lib/product-view.ts's category contract.

// Author name -> URL slug. Vietnamese names carry diacritics that must not ride
// in a URL, so NFD-decompose and strip the combining marks (ễ -> e, ọ -> o,
// à -> a). NFD does NOT decompose đ/Đ (they are atomic code points, not base +
// mark), so map them explicitly. Everything left that is not [a-z0-9] collapses
// to a single hyphen. "Nguyễn Du" -> "nguyen-du", "Vũ Trọng Phụng" ->
// "vu-trong-phung", "Tô Hoài" -> "to-hoai".
export function authorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The author's display name off the product, or undefined when the book carries
// no author. Proper nouns are identical across locales, so there is no
// title_vi-style translation here - the name is the name.
export function productAuthor(
  product: HttpTypes.StoreProduct
): string | undefined {
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  return typeof meta.author === "string" ? meta.author : undefined;
}

// An author as the UI addresses it: by slug (shareable, diacritic-free) plus the
// display name. No locale field - author names do not localize.
export type CatalogAuthor = { slug: string; name: string };

// The distinct authors present in a product list, in catalog order (first
// appearance). Mirrors catalogCategories: the listing chips and the home strip
// both read through here so they cannot disagree on which authors exist or in
// what order they sit.
export function catalogAuthors(
  products: HttpTypes.StoreProduct[]
): CatalogAuthor[] {
  const seen = new Map<string, string>();
  for (const product of products) {
    const name = productAuthor(product);
    if (!name) continue;
    const slug = authorSlug(name);
    if (!seen.has(slug)) seen.set(slug, name);
  }
  return [...seen.entries()].map(([slug, name]) => ({ slug, name }));
}

// The listing filter's URL contract, written by the nav and the home strip and
// read by the listing. Object form rather than a template string so the
// locale-aware Link cannot drop the query while it prefixes the pathname.
export const AUTHOR_PARAM = "author";

export function authorHref(slug: string | null) {
  return slug
    ? { pathname: "/products", query: { [AUTHOR_PARAM]: slug } }
    : { pathname: "/products" };
}

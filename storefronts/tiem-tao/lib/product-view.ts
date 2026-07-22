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

export function categoryLabel(
  product: HttpTypes.StoreProduct,
  locale: string
): string | undefined {
  const cat = product.categories?.[0];
  if (!cat) return undefined;
  const meta = (cat.metadata ?? {}) as Record<string, unknown>;
  if (locale === "vi" && typeof meta.name_vi === "string") return meta.name_vi;
  return cat.name;
}

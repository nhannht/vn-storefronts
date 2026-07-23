"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
import {
  AUTHOR_PARAM,
  authorHref,
  authorSlug,
  catalogAuthors,
  productAuthor,
} from "@/lib/authors";
import { cn } from "@/lib/cn";
import "./products-browser.css";

// The URL owns the filter. Reading it is split out from the listing itself so
// the listing can also be rendered ahead of that read (products/page.tsx uses it
// as the Suspense fallback), which is what keeps the route prerendered.
export function ProductsBrowser({
  products,
}: {
  products: HttpTypes.StoreProduct[];
}) {
  const params = useSearchParams();
  return (
    <ProductsListing products={products} active={params.get(AUTHOR_PARAM)} />
  );
}

// Paper author chips filter the fetched catalog in place, then the paper card
// grid (3-up desktop, 2-up tablet, 1-up mobile). Chips are links, not buttons:
// the filtered view is then shareable, bookmarkable and back-button correct for
// free, and there is no second copy of the selection to keep in sync.
export function ProductsListing({
  products,
  active,
}: {
  products: HttpTypes.StoreProduct[];
  active: string | null;
}) {
  const t = useTranslations("products");

  const authors = useMemo(() => catalogAuthors(products), [products]);

  // A slug the catalog does not have (a stale share, a reseed that dropped an
  // author) resolves to no filter: the full catalog with "All" lit explains
  // itself, an empty grid is a dead end.
  const selected = authors.some((a) => a.slug === active) ? active : null;

  const filtered = selected
    ? products.filter((p) => {
        const name = productAuthor(p);
        return name ? authorSlug(name) === selected : false;
      })
    : products;

  return (
    <div className="mt-8">
      {authors.length > 1 && (
        // The negative inline margins mirror the page container's padding
        // (px-4 / sm:px-6) so the row bleeds to the viewport edge: a chip row
        // that stops short of the edge reads as broken, one that runs off it
        // reads as scrollable.
        <div className="mot-chip-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <FilterChip href={authorHref(null)} active={selected === null}>
            {t("allCategories")}
          </FilterChip>
          {authors.map((a) => (
            <FilterChip
              key={a.slug}
              href={authorHref(a.slug)}
              active={selected === a.slug}
            >
              {a.name}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {filtered.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: ReturnType<typeof authorHref>;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      // Filtering is not a jump to a new page; hold the reader's scroll.
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        // shrink-0 keeps the chip at its intrinsic width, so a row too narrow
        // for its chips overflows (and scrolls) instead of squeezing them.
        "shrink-0 rounded-[var(--radius-button)] border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--hairline)] text-[var(--label-secondary)] hover:border-[var(--hairline-strong)] hover:text-[var(--label-primary)]",
      )}
    >
      {children}
    </Link>
  );
}

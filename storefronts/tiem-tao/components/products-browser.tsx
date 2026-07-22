"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/cn";
import "./products-browser.css";

// Client listing: paper category chips filter the fetched catalog in place,
// then the paper card grid (3-up desktop, 2-up tablet, 1-up mobile).
export function ProductsBrowser({
  products,
}: {
  products: HttpTypes.StoreProduct[];
}) {
  const locale = useLocale();
  const t = useTranslations("products");
  const [active, setActive] = useState<string | null>(null);

  // Category chips derived from the catalog, labeled per locale (name_vi).
  const categories = useMemo(() => {
    const byId = new Map<string, string>();
    for (const p of products) {
      for (const c of p.categories ?? []) {
        if (byId.has(c.id)) continue;
        const meta = (c.metadata ?? {}) as Record<string, unknown>;
        const label =
          locale === "vi" && typeof meta.name_vi === "string"
            ? meta.name_vi
            : (c.name ?? "");
        byId.set(c.id, label);
      }
    }
    return [...byId.entries()].map(([id, label]) => ({ id, label }));
  }, [products, locale]);

  const filtered = active
    ? products.filter((p) => p.categories?.some((c) => c.id === active))
    : products;

  return (
    <div className="mt-8">
      {categories.length > 1 && (
        // The negative inline margins mirror the page container's padding
        // (px-4 / sm:px-6) so the row bleeds to the viewport edge: a chip row
        // that stops short of the edge reads as broken, one that runs off it
        // reads as scrollable.
        <div className="tt-chip-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <FilterChip active={active === null} onClick={() => setActive(null)}>
            {t("allCategories")}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={active === c.id}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
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
    </button>
  );
}

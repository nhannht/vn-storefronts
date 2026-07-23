"use client";

import type { HttpTypes } from "@medusajs/types";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fromAmount } from "@/lib/medusa";
import { formatPrice } from "@/lib/format";
import { localizedTitle } from "@/lib/product-view";
import { productAuthor } from "@/lib/authors";
import { BookCover } from "./book-cover";
import "./product-card.css";

// The small calm cover palette (theme-aware tokens in tokens.css). A cover is a
// typographic panel, not a photo slot, so its only colour is one of these
// washes - assigned by render index, not a hash, so three books always spread
// across three tints instead of possibly landing on one.
const COVER_TINTS = ["--cover-1", "--cover-2", "--cover-3"] as const;

// Paper book card: a portrait cover panel (author eyebrow / serif title hero /
// "Mọt" colophon) over a paper foot carrying the "from" price. The whole card is
// one link to the PDP. Hover life is CSS-only - a spring scale, an accent border
// and a shadow lift (product-card.css) - never glass, never a WebGL glow.
export function ProductCard({
  product,
  index = 0,
}: {
  product: HttpTypes.StoreProduct;
  index?: number;
}) {
  const locale = useLocale();
  const t = useTranslations("products");
  const brand = useTranslations("brand");

  const name = localizedTitle(product, locale);
  const author = productAuthor(product);
  const from = fromAmount(product);
  const tint = COVER_TINTS[index % COVER_TINTS.length];

  return (
    <Link
      href={`/products/${product.handle}`}
      className="mot-card-link group"
      aria-label={name}
    >
      <article className="mot-card">
        <BookCover
          author={author}
          title={name}
          brandName={brand("name")}
          tint={tint}
        />

        <div className="mot-card-foot">
          {from && (
            <p className="mot-card-price">
              <span className="mot-card-from">{t("from")} </span>
              <span className="mot-card-amount">
                {formatPrice(from.amount, from.currency)}
              </span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

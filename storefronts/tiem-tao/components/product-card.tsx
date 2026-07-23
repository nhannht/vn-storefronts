"use client";

import type { HttpTypes } from "@medusajs/types";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BorderGlow from "@/components/reactbits/BorderGlow/BorderGlow";
import { fromAmount } from "@/lib/medusa";
import { formatPrice } from "@/lib/format";
import { installmentMonthly } from "@/lib/installment";
import { localizedTitle, categoryLabel } from "@/lib/product-view";
import "./product-card.css";

const INSTALLMENT_MONTHS = 12;

// Blue-only hover glow. BorderGlow parses these in JS (glow + mesh math), so
// they cannot read CSS vars: keep them mirrored on tokens.css --accent /
// --cta-fill. The mesh trio is all blue so the hover never shows the
// component's default multi-hue border.
const ACCENT_GLOW = "211 90 63"; // #4C9DF5 as "H S L"
const ACCENT_MESH = ["#4C9DF5", "#0071E3", "#0A5BB8"];

// Paper product card per the locked anatomy: 1:1 media with a per-theme vignette
// placeholder, then eyebrow / name / price / installment-hint. The whole card is
// one link; hover = BorderGlow + spring scale 1.02 (both killed by reduced
// motion via globals.css).
export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const locale = useLocale();
  const t = useTranslations("products");

  const name = localizedTitle(product, locale);
  const eyebrow = categoryLabel(product, locale);
  const from = fromAmount(product);
  const initial = name.trim().charAt(0);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="tt-card-link group"
      aria-label={name}
    >
      <BorderGlow
        className="tt-card"
        glowColor={ACCENT_GLOW}
        colors={ACCENT_MESH}
        backgroundColor="var(--paper)"
        borderRadius={26}
        glowRadius={32}
        fillOpacity={0.22}
      >
        <div
          className="tt-card-media relative grid aspect-square place-items-center overflow-hidden p-[12%]"
          style={{ backgroundImage: "var(--vignette)" }}
        >
          <span
            aria-hidden="true"
            className="text-6xl font-semibold text-[var(--label-tertiary)]"
          >
            {initial}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
          {eyebrow && (
            <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-[var(--label-tertiary)]">
              {eyebrow}
            </p>
          )}
          <h3 className="text-xl font-semibold tracking-tight text-[var(--label-primary)]">
            {name}
          </h3>
          {from && (
            <>
              <p className="text-[1.0625rem] font-semibold">
                <span className="font-normal text-[var(--label-tertiary)]">
                  {t("from")}{" "}
                </span>
                <span className="text-[var(--label-primary)]">
                  {formatPrice(from.amount, from.currency)}
                </span>
              </p>
              <p className="text-[0.8125rem] text-[var(--label-tertiary)]">
                {t("perMonth", {
                  amount: formatPrice(
                    installmentMonthly(from.amount, INSTALLMENT_MONTHS),
                    from.currency,
                  ),
                })}
              </p>
            </>
          )}
        </div>
      </BorderGlow>
    </Link>
  );
}

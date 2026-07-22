"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { useCart } from "./cart-provider";
import { useMobileMenu } from "./ui-state";
import { CtaButton } from "./cta-button";
import { SegmentedControl } from "./segmented-control";
import { formatPrice } from "@/lib/format";
import { installmentMonthly } from "@/lib/installment";

const INSTALLMENT_MONTHS = 12;

export function PdpPurchase({
  product,
  title,
}: {
  product: HttpTypes.StoreProduct;
  title: string;
}) {
  const t = useTranslations("pdp");
  const { addItem, busy } = useCart();
  const { open: menuOpen } = useMobileMenu();

  const options = product.options ?? [];
  const variants = product.variants ?? [];

  // Seed the selection from the first priced variant so the PDP opens on a
  // buyable configuration.
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const seed = variants.find((v) => v.calculated_price) ?? variants[0];
    const map: Record<string, string> = {};
    seed?.options?.forEach((vo) => {
      if (vo.option_id && vo.value) map[vo.option_id] = vo.value;
    });
    return map;
  });

  const selectedVariant = useMemo(() => {
    if (!options.length) return variants[0];
    return variants.find((v) =>
      options.every(
        (o) =>
          v.options?.find((vo) => vo.option_id === o.id)?.value ===
          selection[o.id],
      ),
    );
  }, [options, variants, selection]);

  const price = selectedVariant?.calculated_price;
  const amount = price?.calculated_amount ?? undefined;
  const currency =
    price?.currency_code ??
    product.variants?.[0]?.calculated_price?.currency_code ??
    "usd";
  const monthly =
    amount != null ? installmentMonthly(amount, INSTALLMENT_MONTHS) : null;

  // "512GB · Blue Titanium" style summary of the current selection.
  const variantSummary = options
    .map((o) => selection[o.id])
    .filter(Boolean)
    .join(" · ");

  const [added, setAdded] = useState(false);
  const canBuy = Boolean(selectedVariant && amount != null && !busy);

  async function handleAdd() {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const buttonLabel = busy ? t("adding") : added ? t("added") : t("addToCart");

  // The sticky buy bar reveals once the gallery scrolls out of view (per the
  // buy-bar anatomy). Observe a sentinel the page renders at the gallery's end;
  // observing the gallery (not the inline CTA) keeps the trigger correct on
  // mobile, where the inline CTA starts below the fold.
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById("tt-gallery-sentinel");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -8px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Never two floating layers at once: the buy bar hides while the mobile nav
  // sheet is open.
  const showBar = barVisible && !menuOpen;

  return (
    <div className="flex flex-col gap-7">
      {/* Price + installment (presentational demo) */}
      <div>
        <p className="text-[1.75rem] font-semibold tracking-tight text-[var(--label-primary)]">
          {amount != null ? formatPrice(amount, currency) : t("selectVariant")}
        </p>
        {monthly != null && (
          <div className="mt-3 rounded-[var(--radius-button)] border border-[var(--hairline)] bg-[var(--accent-soft)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--accent)]">
              {t("installmentTitle")}
            </p>
            <p className="mt-0.5 text-sm text-[var(--label-secondary)]">
              {t("installmentValue", {
                amount: formatPrice(monthly, currency),
                months: INSTALLMENT_MONTHS,
              })}
            </p>
            <p className="mt-1 text-xs text-[var(--label-tertiary)]">
              {t("installmentNote")}
            </p>
          </div>
        )}
      </div>

      {/* Variant segmented controls */}
      {options.map((option) => {
        const values = Array.from(
          new Set((option.values ?? []).map((v) => v.value)),
        );
        if (!values.length) return null;
        const label =
          option.title?.toLowerCase() === "storage"
            ? t("storage")
            : option.title?.toLowerCase() === "color"
              ? t("color")
              : (option.title ?? "");
        return (
          <SegmentedControl
            key={option.id}
            label={label}
            options={values}
            value={selection[option.id] ?? values[0]}
            onChange={(value) =>
              setSelection((s) => ({ ...s, [option.id]: value }))
            }
          />
        );
      })}

      {/* Inline add to bag (the primary buy affordance) */}
      <CtaButton onClick={handleAdd} disabled={!canBuy} fullWidth>
        {amount == null ? t("outOfStock") : buttonLabel}
      </CtaButton>

      {/* Sticky glass buy bar: the second persistent glass pane on the PDP.
          Fades and rises in once the inline CTA is out of view. */}
      <div
        className={
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-[opacity,transform] duration-200 ease-out " +
          (showBar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")
        }
        aria-hidden={!showBar}
      >
        <div
          className={
            "flex h-16 w-full max-w-[720px] items-center justify-between gap-4 rounded-[var(--radius-pill)] px-5 shadow-[0_10px_40px_-24px_var(--glass-shadow)] " +
            (showBar ? "pointer-events-auto" : "")
          }
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter:
              "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter:
              "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
          }}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--label-primary)]">
              {title}
            </p>
            {variantSummary && (
              <p className="truncate text-xs text-[var(--label-secondary)]">
                {variantSummary}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {amount != null && (
              <p className="hidden text-sm font-semibold text-[var(--label-primary)] sm:block">
                {formatPrice(amount, currency)}
              </p>
            )}
            <CtaButton onClick={handleAdd} disabled={!canBuy} size="sm">
              {amount == null ? t("outOfStock") : t("addToCart")}
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}

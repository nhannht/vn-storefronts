"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { useCart } from "./cart-provider";
import { CtaButton } from "./cta-button";
import { formatPrice } from "@/lib/format";
import { installmentMonthly } from "@/lib/installment";
import { cn } from "@/lib/cn";

const INSTALLMENT_MONTHS = 12;

export function PdpPurchase({ product }: { product: HttpTypes.StoreProduct }) {
  const t = useTranslations("pdp");
  const { addItem, busy } = useCart();

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
        (o) => v.options?.find((vo) => vo.option_id === o.id)?.value === selection[o.id],
      ),
    );
  }, [options, variants, selection]);

  const price = selectedVariant?.calculated_price;
  const amount = price?.calculated_amount ?? undefined;
  const currency = price?.currency_code ?? product.variants?.[0]?.calculated_price?.currency_code ?? "usd";
  const monthly = amount != null ? installmentMonthly(amount, INSTALLMENT_MONTHS) : null;

  const [added, setAdded] = useState(false);

  const canBuy = Boolean(selectedVariant && amount != null && !busy);

  async function handleAdd() {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const buttonLabel = busy ? t("adding") : added ? t("added") : t("addToCart");

  return (
    <div className="flex flex-col gap-7">
      {/* Price + installment */}
      <div>
        <p className="text-3xl font-semibold tracking-tight text-[var(--label-primary)]">
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

      {/* Segmented option controls */}
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
              : option.title;
        return (
          <div key={option.id}>
            <p className="mb-2 text-xs uppercase tracking-widest text-[var(--label-tertiary)]">
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const active = selection[option.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelection((s) => ({ ...s, [option.id]: value }))
                    }
                    aria-pressed={active}
                    className={cn(
                      "rounded-[var(--radius-button)] border px-4 py-2 text-sm transition-colors duration-200",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--label-primary)]"
                        : "border-[var(--hairline)] text-[var(--label-secondary)] hover:border-[var(--hairline-strong)] hover:text-[var(--label-primary)]",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Inline add to bag */}
      <CtaButton onClick={handleAdd} disabled={!canBuy} fullWidth>
        {amount == null ? t("outOfStock") : buttonLabel}
      </CtaButton>

      {/* Sticky glass buy bar: the second (and only transient-extra) glass on the PDP */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
        <div
          className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[var(--radius-pill)] px-5 py-3 shadow-[0_10px_40px_-24px_var(--glass-shadow)]"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter:
              "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
          }}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--label-primary)]">
              {product.title}
            </p>
            {amount != null && (
              <p className="text-sm text-[var(--label-secondary)]">
                {formatPrice(amount, currency)}
              </p>
            )}
          </div>
          <CtaButton
            onClick={handleAdd}
            disabled={!canBuy}
            size="sm"
            className="shrink-0"
          >
            {amount == null ? t("outOfStock") : buttonLabel}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { useCart } from "./cart-provider";
import { CtaButton } from "./cta-button";
import { SegmentedControl } from "./segmented-control";
import { formatPrice } from "@/lib/format";

// A variant, as the product embeds it.
type Variant = NonNullable<HttpTypes.StoreProduct["variants"]>[number];

// The translator as this module needs it: next-intl types t() against the
// namespace's literal keys, but a binding key is only known at runtime, so the
// shape is restated and `has` is what makes the lookup safe. Mirrors
// lib/product-view's AxisTranslator.
type Lookup = { (key: string): string; has(key: string): boolean };

// Localize a binding value (the Cover option value, "Softcover" / "Hardcover") by
// message lookup, falling back to the raw value for a binding the catalog carries
// but the messages do not - the same by-lookup contract as axisLabel, so a new
// binding is a message edit, never a code edit.
function bindingLabel(t: Lookup, value: string): string {
  const key = value.trim().toLowerCase();
  return key && t.has(key) ? t(key) : value;
}

// The Cover value a variant carries on its single option axis. Falls back to the
// variant title, which for this catalog equals the Cover value.
function coverValue(variant: Variant, optionId: string | undefined): string {
  const opt = variant.options?.find((o) => o.option_id === optionId);
  return opt?.value ?? variant.title ?? "";
}

// The PDP purchase panel and the edition mechanic. Each variant is an EDITION:
// its binding is the Cover value, its weight is the book's weight in grams, its
// price is the region-costed calculated_price. One edition -> its detail shows
// with no chooser; two (Kiều) -> a segmented control picks the edition, and its
// knob is the one transient-glass touch. No installments, no buy bar: this panel
// is the whole buy surface, so the selection state lives here, not in a shared
// provider.
export function PdpPurchase({ product }: { product: HttpTypes.StoreProduct }) {
  const t = useTranslations("pdp");
  const { addItem, busy } = useCart();

  const variants = product.variants ?? [];
  const coverOptionId = (product.options ?? []).find(
    (o) => o.title?.trim().toLowerCase() === "cover",
  )?.id;

  // Seed on the first priced variant so the panel opens on a buyable edition.
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => (variants.find((v) => v.calculated_price) ?? variants[0])?.id,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  const binding = selected ? coverValue(selected, coverOptionId) : "";
  const price = selected?.calculated_price;
  const amount = price?.calculated_amount ?? undefined;
  const currency = price?.currency_code ?? "usd";
  const weight = product.weight ?? undefined;

  const [added, setAdded] = useState(false);
  const canBuy = Boolean(selected && amount != null && !busy);

  async function addToCart() {
    if (!selected) return;
    await addItem(selected.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const buttonLabel = busy ? t("adding") : added ? t("added") : t("addToCart");

  return (
    <div className="flex flex-col gap-7">
      {/* Price (region-costed VND / USD) */}
      <p className="text-[1.75rem] font-semibold tracking-tight text-[var(--label-primary)]">
        {amount != null ? formatPrice(amount, currency) : t("selectEdition")}
      </p>

      {/* Edition chooser - only when the book has more than one edition. */}
      {variants.length > 1 && (
        <SegmentedControl
          label={t("editionLabel")}
          value={selected?.id ?? ""}
          options={variants.map((v) => ({
            value: v.id,
            label: bindingLabel(t, coverValue(v, coverOptionId)),
          }))}
          onChange={setSelectedId}
        />
      )}

      {/* The selected edition's detail: name, binding, weight. */}
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-5 py-4">
        <p className="text-[0.9375rem] font-semibold text-[var(--label-primary)]">
          {t("editionName", { binding: bindingLabel(t, binding) })}
        </p>
        <dl className="mt-3 flex flex-col gap-2">
          <div className="flex gap-4">
            <dt className="w-28 shrink-0 text-sm text-[var(--label-tertiary)]">
              {t("binding")}
            </dt>
            <dd className="text-sm text-[var(--label-primary)]">
              {bindingLabel(t, binding)}
            </dd>
          </div>
          {weight != null && (
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-sm text-[var(--label-tertiary)]">
                {t("weight")}
              </dt>
              <dd className="text-sm text-[var(--label-primary)]">
                {t("weightValue", { value: weight })}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Add to cart - the whole buy affordance. */}
      <CtaButton onClick={addToCart} disabled={!canBuy} fullWidth>
        {amount == null ? t("outOfStock") : buttonLabel}
      </CtaButton>
    </div>
  );
}

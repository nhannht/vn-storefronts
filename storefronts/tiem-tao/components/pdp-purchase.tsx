"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { useCart } from "./cart-provider";
import { useMobileMenu } from "./ui-state";
import { CtaButton } from "./cta-button";
import { SegmentedControl } from "./segmented-control";
import { GlassPane } from "./glass-pane";
import { formatPrice } from "@/lib/format";
import { installmentMonthly } from "@/lib/installment";
import { axisLabel } from "@/lib/product-view";

const INSTALLMENT_MONTHS = 12;

// Locked buy-bar metrics: 64px tall, radius 28 (--radius-pill, mirrored in
// glass-pane.tsx), max-width 720, 16px above the viewport bottom edge. Same
// fixed-height / fluid-width split as the nav pill.
const BAR_HEIGHT = 64;

/*
  One purchase state, two views that cannot be one element.

  The inline panel belongs in the right-hand grid column, under the title. The
  buy bar has to be the LAST CHILD OF THE PDP PAGE ROOT, because it is sticky
  and a sticky box is clamped to its parent's content box: the page root ends
  above the footer, so the bar physically cannot travel over the footer. Any
  tighter parent (the purchase panel, the grid column, a wrapper of its own)
  collapses that travel range and the bar stops working.

  Two DOM positions means two components, so the state they share is lifted into
  this provider rather than duplicated or kept in sync by hand.
*/
type Purchase = {
  options: NonNullable<HttpTypes.StoreProduct["options"]>;
  selection: Record<string, string>;
  select: (optionId: string, value: string) => void;
  amount: number | undefined;
  currency: string;
  monthly: number | null;
  variantSummary: string;
  canBuy: boolean;
  buttonLabel: string;
  addToBag: () => void;
  inlineCtaRef: RefObject<HTMLDivElement | null>;
  showBar: boolean;
};

const PurchaseContext = createContext<Purchase | null>(null);

function usePurchase(): Purchase {
  const purchase = useContext(PurchaseContext);
  if (!purchase) {
    throw new Error("PDP purchase views require PdpPurchaseProvider");
  }
  return purchase;
}

export function PdpPurchaseProvider({
  product,
  children,
}: {
  product: HttpTypes.StoreProduct;
  children: React.ReactNode;
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

  // The bar exists to stand in for the inline CTA whenever the inline CTA is
  // not on screen, so the rule is simply "is it on screen", with no regard for
  // which edge it left by. An earlier version also required it to have gone off
  // the TOP, which read as "only after the gallery scrolls past". That is
  // unsatisfiable on these pages: there is less than a viewport of content
  // between the CTA and the end of the page, so by the time it fired the bar
  // had already released from its sticky position and drew mid-screen instead
  // of pinned. Dropping it also fixes the case that most wants a buy bar, the
  // phone where the CTA starts below the fold. Desktop is unaffected: the CTA
  // sits beside the gallery and stays intersecting, so the bar never appears.
  // (A gallery-end sentinel was tried and failed: on desktop the tall
  // two-column gallery never scrolls its bottom above the viewport top.)
  const inlineCtaRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const el = inlineCtaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Never two floating layers at once: the buy bar hides while the mobile nav
  // sheet is open. Staying clear of the footer is layout's job now, not a
  // second observer's - see the sticky note on PdpBuyBar.
  const showBar = barVisible && !menuOpen;

  return (
    <PurchaseContext.Provider
      value={{
        options,
        selection,
        select: (optionId, value) =>
          setSelection((s) => ({ ...s, [optionId]: value })),
        amount,
        currency,
        monthly,
        variantSummary,
        canBuy,
        buttonLabel,
        addToBag: handleAdd,
        inlineCtaRef,
        showBar,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function PdpPurchasePanel() {
  const t = useTranslations("pdp");
  const {
    options,
    selection,
    select,
    amount,
    currency,
    monthly,
    canBuy,
    buttonLabel,
    addToBag,
    inlineCtaRef,
  } = usePurchase();

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
        return (
          <SegmentedControl
            key={option.id}
            label={axisLabel(t, option.title)}
            options={values}
            value={selection[option.id] ?? values[0]}
            onChange={(value) => select(option.id, value)}
          />
        );
      })}

      {/* Inline add to bag (the primary buy affordance; observed for the bar) */}
      <div id="tt-inline-cta" ref={inlineCtaRef}>
        <CtaButton onClick={addToBag} disabled={!canBuy} fullWidth>
          {amount == null ? t("outOfStock") : buttonLabel}
        </CtaButton>
      </div>
    </div>
  );
}

/*
  Sticky glass buy bar: the second persistent glass pane on the PDP. Fades and
  rises in once the inline CTA is out of view.

  STICKY, not fixed, and this element is the whole positioned box - no wrapper
  around it. A sticky box is clamped to its containing block, which is the
  content box of its parent; mounted as the last child of the PDP page root, it
  floats 16px above the viewport bottom for the whole page and then simply docks
  in flow above the footer, which is why no JavaScript has to watch the footer
  any more. Its own 80px of flow (64px pane + pb-4) is also the space the page
  used to reserve with pb-36 for the old fixed bar.

  `inert` rather than aria-hidden: the bar always renders an enabled button, so
  hiding it from a screen reader while leaving it tabbable would make focus
  vanish from the reader's perspective. inert takes the subtree out of the
  accessibility tree AND the tab order together. pointer-events-none still
  carries clicks through the transparent gutters either way.
*/
export function PdpBuyBar({ title }: { title: string }) {
  const t = useTranslations("pdp");
  const { amount, currency, variantSummary, canBuy, addToBag, showBar } =
    usePurchase();

  return (
    <div
      id="tt-buy-bar"
      className={
        "pointer-events-none sticky bottom-0 z-40 flex justify-center pb-4 transition-[opacity,translate] duration-200 ease-out " +
        (showBar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")
      }
      inert={!showBar}
    >
      <GlassPane
        width="100%"
        height={BAR_HEIGHT}
        className={"max-w-[720px] " + (showBar ? "pointer-events-auto" : "")}
      >
        <div className="flex h-full w-full items-center justify-between gap-4 px-5">
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
            <CtaButton onClick={addToBag} disabled={!canBuy} size="sm">
              {amount == null ? t("outOfStock") : t("addToCart")}
            </CtaButton>
          </div>
        </div>
      </GlassPane>
    </div>
  );
}

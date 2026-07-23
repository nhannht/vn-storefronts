"use client";

import { useLocale, useTranslations } from "next-intl";
import type { HttpTypes } from "@medusajs/types";
import { Link } from "@/i18n/navigation";
import { useCart } from "./cart-provider";
import { CtaLink } from "./cta-button";
import { localizedBinding, localizedTitle } from "@/lib/product-view";
import { formatPrice } from "@/lib/format";

// A bag with three books renders three identical steppers and three identical
// remove buttons, so each names itself from its own verb PLUS this line's book
// title: aria-labelledby concatenates the elements it points at, which is the
// only way to build "Increase quantity, Truyen Kieu" out of the verb-only keys
// the catalog carries. Ids are namespaced because the line id alone is not ours.
const cartLineId = (
  itemId: string,
  part: "title" | "increase" | "decrease" | "remove",
) => `mot-cart-${itemId}-${part}`;

// The line's book title in the active locale. The cart embeds *items.product, so
// the Vietnamese title (metadata.title_vi) is resolved through the same helper
// the listing and PDP use; product_title / title are the English fallbacks when
// the embed or the metadata is absent.
function lineTitle(
  item: HttpTypes.StoreCartLineItem,
  locale: string,
): string {
  if (item.product) return localizedTitle(item.product, locale);
  return item.product_title ?? item.title ?? "";
}

export function CartView() {
  const t = useTranslations("cart");
  const tp = useTranslations("pdp");
  const locale = useLocale();
  const { cart, setQuantity, removeItem, busy } = useCart();

  const currency = cart?.currency_code ?? "usd";
  const items = cart?.items ?? [];

  if (!items.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-16 text-center shadow-[var(--shadow-card)]">
        <p className="text-[var(--label-secondary)]">{t("empty")}</p>
        <CtaLink href="/products" size="sm" className="mt-6">
          {t("continue")}
        </CtaLink>
      </div>
    );
  }

  const subtotal =
    cart?.item_subtotal ??
    items.reduce((s, i) => s + (i.unit_price ?? 0) * (i.quantity ?? 0), 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      {/* One paper surface; the lines are separated by hairline rules rather
          than floating as individual cards. */}
      <ul className="divide-y divide-[var(--hairline)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] shadow-[var(--shadow-card)]">
        {items.map((item) => {
          const title = lineTitle(item, locale);
          return (
            <li key={item.id} className="flex gap-4 p-5">
              {/* A mini typographic cover: the book's initial on a soft sage
                  wash, echoing the catalog's coverless, letter-first covers. */}
              <div
                aria-hidden="true"
                className="grid size-20 shrink-0 place-items-center rounded-[var(--radius-button)] bg-[var(--accent-soft)]"
              >
                <span className="font-serif text-2xl font-semibold text-[var(--label-tertiary)]">
                  {title.trim().charAt(0)}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      id={cartLineId(item.id, "title")}
                      className="truncate font-serif text-[0.9375rem] font-semibold text-[var(--label-primary)]"
                    >
                      {title}
                    </p>
                    {item.variant_title && (
                      <p className="truncate text-xs text-[var(--label-secondary)]">
                        {localizedBinding(tp, item.variant_title)}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--label-tertiary)]">
                      {formatPrice(item.unit_price ?? 0, currency)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-[var(--label-primary)]">
                    {formatPrice(
                      item.total ??
                        (item.unit_price ?? 0) * (item.quantity ?? 0),
                      currency,
                    )}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-[var(--radius-button)] border border-[var(--hairline)]">
                    <button
                      type="button"
                      aria-labelledby={`${cartLineId(item.id, "decrease")} ${cartLineId(item.id, "title")}`}
                      disabled={busy}
                      onClick={() =>
                        setQuantity(item.id, (item.quantity ?? 1) - 1)
                      }
                      className="px-3 py-1.5 text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)] disabled:opacity-50"
                    >
                      <span
                        id={cartLineId(item.id, "decrease")}
                        className="sr-only"
                      >
                        {t("decrease")}
                      </span>
                      {/* The glyph is decoration once the button has a real
                          name; left in the tree it is announced as bare
                          punctuation. */}
                      <span aria-hidden="true">-</span>
                    </button>
                    <span className="min-w-8 text-center text-sm text-[var(--label-primary)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-labelledby={`${cartLineId(item.id, "increase")} ${cartLineId(item.id, "title")}`}
                      disabled={busy}
                      onClick={() =>
                        setQuantity(item.id, (item.quantity ?? 1) + 1)
                      }
                      className="px-3 py-1.5 text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)] disabled:opacity-50"
                    >
                      <span
                        id={cartLineId(item.id, "increase")}
                        className="sr-only"
                      >
                        {t("increase")}
                      </span>
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-labelledby={`${cartLineId(item.id, "remove")} ${cartLineId(item.id, "title")}`}
                    disabled={busy}
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-[var(--label-tertiary)] transition-colors duration-200 hover:text-[var(--accent)] disabled:opacity-50"
                  >
                    {/* The visible label IS the verb here, so it carries the id
                        instead of a duplicate sr-only copy. */}
                    <span id={cartLineId(item.id, "remove")}>{t("remove")}</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--label-secondary)]">
            {t("subtotal")}
          </span>
          <span className="text-lg font-semibold text-[var(--label-primary)]">
            {formatPrice(subtotal, currency)}
          </span>
        </div>
        <CtaLink href="/checkout" fullWidth className="mt-5">
          {t("checkout")}
        </CtaLink>
        <Link
          href="/products"
          className="mt-3 inline-flex w-full items-center justify-center text-sm text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]"
        >
          {t("continue")}
        </Link>
      </aside>
    </div>
  );
}

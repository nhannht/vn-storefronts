"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const t = useTranslations("cart");
  const { cart, setQuantity, removeItem, busy } = useCart();

  const currency = cart?.currency_code ?? "usd";
  const items = cart?.items ?? [];

  if (!items.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 text-center">
        <p className="text-[var(--label-secondary)]">{t("empty")}</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-5 py-2.5 text-sm font-semibold text-[var(--cta-label)]"
        >
          {t("continue")}
        </Link>
      </div>
    );
  }

  const subtotal =
    cart?.item_subtotal ??
    items.reduce((s, i) => s + (i.unit_price ?? 0) * (i.quantity ?? 0), 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-4 rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-4"
          >
            <div
              className="grid size-20 shrink-0 place-items-center rounded-[var(--radius-button)]"
              style={{ backgroundImage: "var(--vignette)" }}
            >
              <span aria-hidden="true" className="text-2xl font-semibold text-[var(--label-tertiary)]">
                {(item.product_title ?? item.title ?? "").trim().charAt(0)}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--label-primary)]">
                    {item.product_title ?? item.title}
                  </p>
                  {item.variant_title && (
                    <p className="truncate text-xs text-[var(--label-secondary)]">
                      {item.variant_title}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-medium text-[var(--label-primary)]">
                  {formatPrice(
                    item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 0),
                    currency,
                  )}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-[var(--radius-button)] border border-[var(--hairline)]">
                  <button
                    type="button"
                    aria-label="-"
                    disabled={busy}
                    onClick={() => setQuantity(item.id, (item.quantity ?? 1) - 1)}
                    className="px-3 py-1.5 text-[var(--label-secondary)] disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm text-[var(--label-primary)]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    disabled={busy}
                    onClick={() => setQuantity(item.id, (item.quantity ?? 1) + 1)}
                    className="px-3 py-1.5 text-[var(--label-secondary)] disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-[var(--label-tertiary)] transition-colors duration-200 hover:text-[var(--accent)] disabled:opacity-50"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--label-secondary)]">
            {t("subtotal")}
          </span>
          <span className="text-lg font-semibold text-[var(--label-primary)]">
            {formatPrice(subtotal, currency)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-5 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-5 py-3 text-sm font-semibold text-[var(--cta-label)] transition-transform duration-200 hover:scale-[1.02]"
        >
          {t("checkout")}
        </Link>
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

import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { sdk } from "@/lib/sdk";
import { formatPrice } from "@/lib/format";

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("order");

  let order;
  try {
    const res = await sdk.store.order.retrieve(id, {
      fields: "id,display_id,email,total,currency_code,*items",
    });
    order = res.order;
  } catch {
    notFound();
  }
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--accent-soft)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-[var(--label-primary)]">
        {t("confirmedTitle")}
      </h1>
      <p className="mt-3 text-[var(--label-secondary)]">{t("thanks")}</p>

      <div className="mx-auto mt-8 max-w-sm rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-5 text-left shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--label-secondary)]">{t("orderId")}</span>
          <span className="font-medium text-[var(--label-primary)]">
            #{order.display_id ?? order.id}
          </span>
        </div>
        {order.email && (
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="shrink-0 text-[var(--label-secondary)]">
              {t("email")}
            </span>
            {/* An address is a receipt fact the buyer checks, so it wraps
                rather than truncating like the book titles elsewhere. */}
            <span className="min-w-0 break-all text-right font-medium text-[var(--label-primary)]">
              {order.email}
            </span>
          </div>
        )}
        {/* Guarded apart from the email: a missing total must not take the
            address down with it. Emphasis matches the cart and checkout
            totals - hairline rule above, the amount a size up. */}
        {order.total != null && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--hairline)] pt-4">
            <span className="text-sm text-[var(--label-secondary)]">
              {t("total")}
            </span>
            <span className="text-lg font-semibold text-[var(--label-primary)]">
              {formatPrice(order.total, order.currency_code ?? "usd")}
            </span>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-9 inline-flex rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-6 py-3 text-sm font-semibold text-[var(--cta-label)]"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}

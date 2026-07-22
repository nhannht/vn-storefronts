"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "./cart-provider";
import { sdk } from "@/lib/sdk";
import { formatPrice } from "@/lib/format";

type Fields = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
};

const EMPTY: Fields = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  phone: "",
};

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { cart, clear } = useCart();

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = cart?.currency_code ?? "usd";
  const items = cart?.items ?? [];

  // COD is configured on the VN (VND) region; the INTL (USD) region routes to
  // Stripe, whose test key is an administrator-side blocker.
  const codAvailable = (cart?.region?.currency_code ?? "").toLowerCase() === "vnd";
  const [method, setMethod] = useState<"cod" | "card">(
    codAvailable ? "cod" : "card",
  );

  const countryCode =
    cart?.region?.countries?.[0]?.iso_2?.toLowerCase() ??
    (codAvailable ? "vn" : "us");

  if (!items.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 text-center">
        <p className="text-[var(--label-secondary)]">{tCart("empty")}</p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-5 py-2.5 text-sm font-semibold text-[var(--cta-label)]"
        >
          {tCart("continue")}
        </Link>
      </div>
    );
  }

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || method !== "cod") return;
    setSubmitting(true);
    setError(null);
    try {
      const address = {
        first_name: fields.firstName,
        last_name: fields.lastName,
        address_1: fields.address,
        city: fields.city,
        phone: fields.phone,
        country_code: countryCode,
      };

      await sdk.store.cart.update(cart.id, {
        email: fields.email,
        shipping_address: address,
        billing_address: address,
      });

      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
        cart_id: cart.id,
      });
      const option = shipping_options?.[0];
      if (!option) throw new Error("No shipping option available for this cart.");

      const { cart: withShipping } = await sdk.store.cart.addShippingMethod(
        cart.id,
        { option_id: option.id },
      );

      await sdk.store.payment.initiatePaymentSession(withShipping, {
        provider_id: "pp_system_default",
      });

      const result = await sdk.store.cart.complete(cart.id);
      if (result.type === "order") {
        clear();
        router.push(`/order/confirmed/${result.order.id}`);
      } else {
        setError(
          typeof result.error?.message === "string"
            ? result.error.message
            : "Order could not be completed.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal =
    cart?.item_subtotal ??
    items.reduce((s, i) => s + (i.unit_price ?? 0) * (i.quantity ?? 0), 0);

  const inputClass =
    "w-full rounded-[var(--radius-button)] border border-[var(--hairline)] bg-[var(--base)] px-4 py-2.5 text-sm text-[var(--label-primary)] outline-none placeholder:text-[var(--label-tertiary)] focus:border-[var(--accent)]";
  const labelClass = "mb-1.5 block text-xs text-[var(--label-secondary)]";

  return (
    <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-8">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[var(--label-primary)]">
            {t("contact")}
          </legend>
          <label className={labelClass} htmlFor="email">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[var(--label-primary)]">
            {t("shipping")}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="firstName">
                {t("firstName")}
              </label>
              <input
                id="firstName"
                required
                value={fields.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">
                {t("lastName")}
              </label>
              <input
                id="lastName"
                required
                value={fields.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="address">
                {t("address")}
              </label>
              <input
                id="address"
                required
                value={fields.address}
                onChange={(e) => set("address", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="city">
                {t("city")}
              </label>
              <input
                id="city"
                required
                value={fields.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">
                {t("phone")}
              </label>
              <input
                id="phone"
                required
                value={fields.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[var(--label-primary)]">
            {t("payment")}
          </legend>
          <div className="flex flex-col gap-3">
            <label
              className={`flex items-center gap-3 rounded-[var(--radius-button)] border px-4 py-3 text-sm ${
                method === "cod"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--hairline)]"
              } ${codAvailable ? "cursor-pointer" : "opacity-50"}`}
            >
              <input
                type="radio"
                name="payment"
                checked={method === "cod"}
                disabled={!codAvailable}
                onChange={() => setMethod("cod")}
                className="accent-[var(--accent)]"
              />
              <span className="text-[var(--label-primary)]">{t("cod")}</span>
            </label>

            <label className="flex cursor-not-allowed items-center gap-3 rounded-[var(--radius-button)] border border-[var(--hairline)] px-4 py-3 text-sm opacity-60">
              <input
                type="radio"
                name="payment"
                checked={method === "card"}
                disabled
                onChange={() => setMethod("card")}
                className="accent-[var(--accent)]"
              />
              <span className="text-[var(--label-primary)]">{t("card")}</span>
            </label>

            {(!codAvailable || method === "card") && (
              <p className="text-xs text-[var(--label-tertiary)]">
                {t("stripeBlocked")}
              </p>
            )}
          </div>
        </fieldset>

        {error && (
          <p className="rounded-[var(--radius-button)] border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--label-primary)]">
            {error}
          </p>
        )}
      </div>

      <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-6 lg:sticky lg:top-24">
        <p className="text-sm font-semibold text-[var(--label-primary)]">
          {t("summary")}
        </p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0 truncate text-[var(--label-secondary)]">
                {item.quantity}x {item.product_title ?? item.title}
              </span>
              <span className="shrink-0 text-[var(--label-primary)]">
                {formatPrice(
                  item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 0),
                  currency,
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--hairline)] pt-4">
          <span className="text-sm text-[var(--label-secondary)]">
            {t("summary")}
          </span>
          <span className="text-lg font-semibold text-[var(--label-primary)]">
            {formatPrice(subtotal, currency)}
          </span>
        </div>

        <button
          type="submit"
          disabled={!codAvailable || submitting}
          className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-5 py-3 text-sm font-semibold text-[var(--cta-label)] transition-transform duration-200 enabled:hover:scale-[1.02] disabled:opacity-45"
        >
          {submitting ? t("placing") : t("placeOrder")}
        </button>
      </aside>
    </form>
  );
}

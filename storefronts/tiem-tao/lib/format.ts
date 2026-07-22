// Region-aware price formatting. Amounts from Medusa are in the currency's
// major unit (e.g. 28990000 for VND, 1199 for USD). Intl.NumberFormat applies
// the currency's own fraction digits, so VND renders with no decimals and USD
// with two. Never hand-format prices.
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = currencyCode.toUpperCase();
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

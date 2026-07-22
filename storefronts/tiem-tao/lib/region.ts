import { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import type { Locale } from "@/i18n/routing";

// vi -> Vietnam region (VND), en -> International region (USD).
const CURRENCY_BY_LOCALE: Record<Locale, string> = {
  vi: "vnd",
  en: "usd",
};

export async function getRegion(
  locale: Locale
): Promise<HttpTypes.StoreRegion | undefined> {
  const { regions } = await sdk.store.region.list();
  const currency = CURRENCY_BY_LOCALE[locale];
  return regions.find((r) => r.currency_code === currency) ?? regions[0];
}

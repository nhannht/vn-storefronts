import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Vietnamese is the primary market; English is the international locale.
  locales: ["vi", "en"],
  defaultLocale: "vi",
});

export type Locale = (typeof routing.locales)[number];

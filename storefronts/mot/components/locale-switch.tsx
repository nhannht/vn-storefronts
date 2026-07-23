"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

// Switches locale while staying on the current path.
export function LocaleSwitch() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("nav");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-1 rounded-full border border-[var(--hairline)] p-0.5 text-xs"
    >
      {routing.locales.map((loc) => {
        const current = loc === active;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            aria-current={current ? "true" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors duration-200",
              current
                ? "bg-[var(--accent-soft)] text-[var(--label-primary)]"
                : "text-[var(--label-tertiary)] hover:text-[var(--label-secondary)]",
            )}
          >
            {loc}
          </Link>
        );
      })}
    </div>
  );
}

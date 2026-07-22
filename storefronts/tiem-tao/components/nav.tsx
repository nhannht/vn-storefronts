"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { GlassPane } from "./glass-pane";
import { useCart } from "./cart-provider";
import { useMobileMenu } from "./ui-state";
import { cn } from "@/lib/cn";

// Locked pill metrics: 52px tall, radius 28 (--radius-pill, mirrored in
// glass-pane.tsx), content-sized width. Fixing the height is also what keeps
// the glass pane fluid: only the width is left to measure.
const PILL_HEIGHT = 52;

// Body ramp (1.0625rem / line-height 1.47). The wordmark takes it at semibold,
// the section links at regular weight on the label ladder.
const BODY = "text-[1.0625rem] leading-[1.47]";

export function Nav() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const pathname = usePathname();
  const { count } = useCart();
  const { open, setOpen } = useMobileMenu();

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="flex justify-center">
        {/* The one persistent glass surface per view. GlassSurface renders its
            own div, so the nav landmark sits just inside it. */}
        <GlassPane width="auto" height={PILL_HEIGHT} className="max-w-full">
        <nav
          aria-label="Primary"
          className="flex h-full items-center gap-6 px-5"
        >
        <Link
          href="/"
          className={cn(
            BODY,
            "font-semibold tracking-tight text-[var(--label-primary)]",
          )}
        >
          {brand("name")}
        </Link>

        <div className="hidden items-center gap-7 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                BODY,
                "transition-colors duration-200",
                isActive(l.href)
                  ? "text-[var(--label-primary)]"
                  : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <LocaleSwitch />
          <ThemeToggle />
          <Link
            href="/cart"
            className={cn(
              BODY,
              "inline-flex items-center gap-1.5 text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]",
            )}
          >
            {t("cart")}
            {count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-[var(--cta-fill)] px-1.5 text-xs font-semibold text-[var(--cta-label)]">
                {count}
              </span>
            )}
          </Link>
        </div>

        <Link
          href="/cart"
          aria-label={t("cart")}
          className="relative grid size-9 place-items-center rounded-full border border-[var(--hairline)] text-[var(--label-secondary)] sm:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 8h12l-1 12H7L6 8z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9 8V6.5a3 3 0 0 1 6 0V8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[var(--cta-fill)] px-1 text-[10px] font-semibold text-[var(--cta-label)]">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className="grid size-9 place-items-center rounded-full border border-[var(--hairline)] text-[var(--label-secondary)] sm:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        </nav>
        </GlassPane>
      </div>

      {open && (
        <div
          className="mx-auto mt-2 w-[min(92vw,22rem)] rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-4 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-[var(--radius-button)] px-3 py-2.5 text-sm",
                  isActive(l.href)
                    ? "bg-[var(--accent-soft)] text-[var(--label-primary)]"
                    : "text-[var(--label-secondary)]",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-[var(--label-secondary)]"
            >
              <span>{t("cart")}</span>
              {count > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-[var(--cta-fill)] px-1.5 text-xs font-semibold text-[var(--cta-label)]">
                  {count}
                </span>
              )}
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--hairline)] pt-3">
            <LocaleSwitch />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}

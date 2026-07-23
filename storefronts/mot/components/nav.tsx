"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CardNav, { type CardNavItem } from "./reactbits/CardNav/CardNav";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { useCart } from "./cart-provider";
import { authorSlug } from "@/lib/authors";

// Authors carried by the ?author= filter contract (the Phase 3 listing reads
// it). Names are proper nouns, identical across locales, so they live here
// rather than duplicated in both message catalogs; the localized part (the
// "Books by ..." aria label) is composed from a message with a {name} slot. The
// slug is derived through authorSlug so the slug logic lives in one place and
// the nav can never disagree with the listing on what a name slugs to.
const AUTHORS = [
  { name: "Nguyễn Du" },
  { name: "Vũ Trọng Phụng" },
  { name: "Tô Hoài" },
];

// mot's nav: the adapted paper Card Nav (never glass in Phase 2). The wordmark
// is serif text, and the right cluster (locale switch, theme toggle, cart CTA)
// is passed through the controls slot.
export function Nav() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const { count } = useCart();

  const cardBg = "var(--sage-pastel)";
  const cardText = "var(--label-primary)";

  const items: CardNavItem[] = [
    {
      label: t("booksCard"),
      bgColor: cardBg,
      textColor: cardText,
      links: [
        { label: t("allBooks"), href: "/products", ariaLabel: t("allBooks") },
        { label: t("featured"), href: "/products", ariaLabel: t("featured") },
      ],
    },
    {
      label: t("authorsCard"),
      bgColor: cardBg,
      textColor: cardText,
      links: AUTHORS.map((a) => ({
        label: a.name,
        href: { pathname: "/products", query: { author: authorSlug(a.name) } },
        ariaLabel: t("booksByAuthor", { name: a.name }),
      })),
    },
    {
      label: t("aboutCard"),
      bgColor: cardBg,
      textColor: cardText,
      links: [
        { label: t("about"), href: "/", ariaLabel: t("about") },
        {
          label: t("publicDomain"),
          href: "/products",
          ariaLabel: t("publicDomain"),
        },
      ],
    },
  ];

  const wordmark = (
    <Link
      href="/"
      aria-label={brand("name")}
      className="font-serif text-[1.4rem] font-semibold leading-none tracking-tight text-[var(--label-primary)]"
    >
      {brand("name")}
    </Link>
  );

  const controls = (
    <>
      <LocaleSwitch />
      <ThemeToggle />
      <Link
        href="/cart"
        aria-label={t("cart")}
        className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-3 text-sm font-medium text-[var(--cta-label)] transition-opacity duration-200 hover:opacity-90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        <span className="hidden sm:inline">{t("cart")}</span>
        {count > 0 && (
          <span className="grid min-w-4 place-items-center rounded-full bg-[var(--cta-label)] px-1 text-[11px] font-semibold text-[var(--cta-fill)]">
            {count}
          </span>
        )}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <CardNav
        logo={wordmark}
        controls={controls}
        items={items}
        baseColor="var(--paper)"
        menuColor="var(--label-primary)"
        menuAriaLabel={{ open: t("openMenu"), close: t("closeMenu") }}
      />
    </header>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { createTranslator } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

// Serves /_not-found: the route Next resolves for a URL that matches nothing at
// all (/vi/garbage, /en/garbage, /nonsense). That route sits OUTSIDE the
// [locale] segment and app/layout.tsx is a bare passthrough, so this file owns
// the whole document (<html>/<body>). It stays request-free so it never forces
// the rest of the storefront off static prerendering, which means the locale is
// not known here: an unmatched URL carries nothing that says which language the
// visitor wanted. The panel answers in every configured language at once,
// Vietnamese first because it is the default locale. The locale-aware 404 is
// app/[locale]/not-found.tsx.

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
  display: "swap",
});

// Same light-default pre-paint stamp as the locale layout: without it this
// document paints in the wrong theme before hydration.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.dataset.theme=t;}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Mọt",
  description: "Portfolio demo bookstore. Public-domain works.",
};

// Static catalog imports, because a request-scoped translator is precisely what
// this file cannot have. createTranslator is the request-free half of next-intl,
// so the copy still comes from the catalogs rather than being inlined here. The
// Record<Locale, ...> annotation is the point of the map: adding a locale to
// routing without a catalog entry here is a type error, not a language silently
// missing from the panel.
const MESSAGES: Record<Locale, typeof viMessages> = {
  vi: viMessages,
  en: enMessages,
};

const CTA_CLASS =
  "inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-6 py-3 text-sm font-semibold text-[var(--cta-label)] transition-transform duration-150 active:scale-[0.985]";

const QUIET_LINK_CLASS =
  "mt-4 text-sm text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]";

export default function NotFound() {
  // brand.name is identical in both catalogs, so the default locale's is enough.
  const brand = createTranslator({
    locale: routing.defaultLocale,
    messages: MESSAGES[routing.defaultLocale],
    namespace: "brand",
  });

  const blocks = routing.locales.map((locale, i) => {
    const t = createTranslator({
      locale,
      messages: MESSAGES[locale],
      namespace: "notFound",
    });

    // Both blocks are styled identically - they are a language pair, not a
    // hierarchy - but the document is lang="vi", so the Vietnamese title is its
    // <h1> and the English one reads as a translation of it.
    const Title = i === 0 ? "h1" : "h2";

    // One hairline between the two, vertical on wide screens and horizontal once
    // they stack.
    const seam =
      i === 0
        ? "pb-10 sm:pb-0 sm:pr-10"
        : "border-t border-[var(--hairline)] pt-10 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0";

    // Plain anchors with explicit locale prefixes. The locale-aware Link from
    // @/i18n/navigation resolves against a request locale that does not exist
    // here, and a full document load is the correct transition anyway: this
    // shell owns its own <html>, so entering the locale layout replaces the
    // document root rather than reconciling with it.
    return (
      <section key={locale} lang={locale} className={`text-center ${seam}`}>
        <Title className="font-serif text-2xl font-semibold tracking-tight text-[var(--label-primary)]">
          {t("title")}
        </Title>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-col items-center">
          <a href={`/${locale}/products`} hrefLang={locale} className={CTA_CLASS}>
            {t("browse")}
          </a>
          <a href={`/${locale}`} hrefLang={locale} className={QUIET_LINK_CLASS}>
            {t("back")}
          </a>
        </div>
      </section>
    );
  });

  return (
    <html
      lang={routing.defaultLocale}
      className={`${inter.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grid min-h-screen place-items-center px-5 py-20">
        <main className="w-full max-w-3xl">
          {/* Resting surface, so paper: opaque fill, hairline, card radius. */}
          <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 sm:px-10">
            <div className="text-center">
              <p className="font-serif text-lg font-semibold tracking-tight text-[var(--label-primary)]">
                {brand("name")}
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">
                404
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2">{blocks}</div>
          </div>
        </main>
      </body>
    </html>
  );
}

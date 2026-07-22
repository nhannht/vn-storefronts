import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createTranslator } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

// Serves /_not-found, the route Next resolves for a URL that matches nothing at
// all (/vi/garbage, /en/garbage, /nonsense). That route sits OUTSIDE the
// [locale] segment and app/layout.tsx is a bare passthrough, so this file has to
// own the whole document. Without <html>/<body> Next substitutes its blank
// <html id="__next_error__"> shell and the visitor gets no stylesheet and no way
// back. Owning the document is the same contract app/[locale]/layout.tsx already
// fulfils - the passthrough root exists so each top-level branch sets its own
// <html lang>.
//
// It is also the only 404 whose status is settled before rendering starts, so
// nothing is thrown mid-stream and the panel below is real server HTML. The
// thrown-notFound() case is a different mechanism; see app/[locale]/not-found.tsx.
//
// STATIC ON PURPOSE, and that is load-bearing. Every route in the app is a child
// of the root segment, so any request state read HERE - getLocale(), getRegion(),
// headers(), cookies(), or a provider that needs one of them - forces the dynamic
// bailout onto /vi, /en, /cart, /checkout and /products too. Measured by
// elimination across four builds: a request-reading root 404 turned every route
// Dynamic; removing the reads put all of them back to SSG and made /_not-found
// Static. A localized root 404 costs the entire storefront's prerendering, which
// is not a trade worth making.
//
// So the locale is not guessed. An unmatched URL carries nothing that says which
// language the visitor wanted, and inventing a preference would serve Vietnamese
// copy to /en/* half the time. The panel answers in every configured language at
// once instead - Vietnamese first because it is the default locale.

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

// Pre-paint theme stamp, same script as the locale layout: without it this
// document paints in the wrong theme before hydration.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){}})();`;

// Mirrors app/[locale]/layout.tsx so an unmatched URL carries the same head as
// every other route.
export const metadata: Metadata = {
  title: "Tiệm Táo",
  description: "Portfolio demo storefront. Not affiliated with Apple Inc.",
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

// The locked primary-CTA contract from components/cta-button.tsx - gold fill,
// near-black label, radius 18, semibold - restated as a static anchor. CtaLink
// itself is unusable here twice over: it is a client component, and its Link
// resolves hrefs against a request locale this document does not have. The press
// affordance survives as :active rather than pointer handlers, so this document
// mounts no client component of ours and still goes paper -> transient glass on
// hold, exactly as the materials rule asks.
const CTA_CLASS =
  "inline-flex items-center justify-center rounded-[18px] bg-[var(--cta-fill)] px-6 py-3 text-sm font-semibold text-[var(--cta-label)] transition-[transform,background-color] duration-150 active:scale-[0.985] active:bg-[var(--cta-glass)] active:backdrop-blur-[10px] active:backdrop-saturate-[160%]";

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
        <Title className="text-2xl font-semibold tracking-tight text-[var(--label-primary)]">
          {t("title")}
        </Title>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-col items-center">
          <a
            href={`/${locale}/products`}
            hrefLang={locale}
            className={CTA_CLASS}
          >
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
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grid min-h-screen place-items-center px-5 py-20">
        <main className="w-full max-w-3xl">
          {/* Resting surface, so paper: opaque fill, hairline, card radius.
              Glass is reserved for the floating nav pill, which this document
              cannot mount anyway - it needs cart context, and cart needs a
              region, and a region needs the request. */}
          <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 sm:px-10">
            <div className="text-center">
              <p className="text-lg font-semibold tracking-tight text-[var(--label-primary)]">
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

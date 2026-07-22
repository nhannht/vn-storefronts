import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CtaLink } from "@/components/cta-button";

// Boundary for notFound() thrown anywhere under /[locale]. It renders as a
// child of app/[locale]/layout.tsx, so it inherits the whole shell - theme
// stamp, Nav, Footer, providers - and only has to supply the panel.
//
// This is the locale-aware 404, which is the one thing app/not-found.tsx cannot
// be: that file serves URLs matching no route at all, where nothing identifies
// the visitor's language, and it has to stay free of request state or the whole
// storefront loses static prerendering. So it answers bilingually and this panel
// answers in the locale the route already established. Same materials, different
// amount of knowledge - not two copies of one design.
//
// Keeping a boundary here additionally stops app/not-found.tsx - which owns a
// complete <html> document - from being picked as the nearest boundary inside a
// locale route, where its <html> would nest inside the layout's.
//
// Known limit: notFound() is thrown while React is streaming HTML, and the
// server renderer has no error-boundary recovery, so Next answers a thrown 404
// with a blank <html id="__next_error__"> shell and this panel is recovered on
// the client from the flight payload. The unmatched-URL 404 has no such limit -
// see app/not-found.tsx. That is also why /[locale]/products/[handle] no longer
// throws at runtime: it freezes its handles and lets the router reject the rest,
// which turns a missing product into the unmatched-URL case. The remaining live
// throw site is /[locale]/order/confirmed/[id], where an unknown id still takes
// the client-recovery path.
//
// A not-found boundary receives no props by design, so the locale is not ours
// to read. next-intl resolves it from the setRequestLocale() the locale layout
// already made for this request (the proxy's locale header is its fallback).
export default async function NotFoundPanel() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      {/* Resting surface, so paper: opaque fill, hairline, card radius. Glass
          is reserved for the floating nav pill. */}
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--label-primary)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
          {t("body")}
        </p>

        {/* Two ways out, never a dead end: the catalog as the primary move,
            home as the quiet one. */}
        <div className="mt-9 flex flex-col items-center">
          <CtaLink href="/products">{t("browse")}</CtaLink>
          <Link
            href="/"
            className="mt-4 text-sm text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}

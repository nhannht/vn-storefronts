import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Locale-aware 404 panel. It renders as a child of app/[locale]/layout.tsx, so
// it inherits the whole shell (theme stamp, header, footer, providers) and only
// supplies the panel. The unmatched-URL 404 with no locale is app/not-found.tsx.
export default async function NotFoundPanel() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      {/* Resting surface, so paper: opaque fill, hairline, card radius. */}
      <div className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-14 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--label-primary)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
          {t("body")}
        </p>

        <div className="mt-9 flex flex-col items-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-6 py-3 text-sm font-semibold text-[var(--cta-label)] transition-transform duration-150 active:scale-[0.985]"
          >
            {t("browse")}
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}

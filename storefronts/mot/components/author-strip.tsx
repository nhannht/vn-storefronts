import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { authorHref, type CatalogAuthor } from "@/lib/authors";

// Author strip: the home page's doors into the listing.
//
// It sits under the featured card grid, so it deliberately is not cards - short
// wide paper bands, one line of type bottom-anchored - same material, different
// proportion, so the eye reads a second object rather than a second grid. mot
// has no cover art and no per-author copy, so a door earns its presence from
// material (paper + hairline, the card contract) rather than inventing content.
// Author names are running UI here, so they stay in sans, not the serif reserved
// for book titles and display headings.
//
// Each door is a real link carrying the ?author= filter, so the listing lands
// already filtered instead of dropping the reader on the full catalog.
export async function AuthorStrip({
  authors,
}: {
  authors: CatalogAuthor[];
}) {
  const t = await getTranslations("home");

  if (authors.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
        {t("authorsTitle")}
      </h2>
      <p className="mt-2 text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
        {t("authorsSubtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {authors.map((author) => (
          <Link
            key={author.slug}
            href={authorHref(author.slug)}
            // Hover is the card contract: spring scale to 1.02 plus an accent
            // border and a shadow lift, nothing else. Paper, never glass.
            className="flex min-h-[112px] flex-col justify-end rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)] transition-[transform,border-color,box-shadow] duration-[320ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:border-[var(--accent)] hover:shadow-[var(--shadow-card-hover)] md:min-h-[160px]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xl font-semibold text-[var(--label-primary)]">
                {author.name}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="shrink-0 text-[var(--accent)]"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

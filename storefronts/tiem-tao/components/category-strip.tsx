import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryHref, type CatalogCategory } from "@/lib/product-view";

// Category strips: the home page's doors into the listing.
//
// They sit directly under the featured card grid, so they deliberately are not
// cards - short wide paper bands, no 1:1 media well, one line of type bottom-
// anchored. Same materials, different proportion, so the eye reads a second
// object rather than a second grid. There is no photography and no per-category
// copy in the catalogs, so the tile earns its presence from material (the same
// gold vignette the card media wells use) instead of inventing content.
//
// Each tile is a real link carrying the filter in the URL, so the listing lands
// already filtered instead of dumping the reader on the full catalog.
export async function CategoryStrip({
  categories,
}: {
  categories: CatalogCategory[];
}) {
  const t = await getTranslations("home");

  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
        {t("categoriesTitle")}
      </h2>
      <p className="mt-2 text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
        {t("categoriesSubtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {categories.map((category) => (
          <Link
            key={category.handle}
            href={categoryHref(category.handle)}
            style={{ backgroundImage: "var(--vignette)" }}
            // Hover is the card contract: spring scale to 1.02 plus a gold
            // border glow, nothing else. Paper, never glass - the nav pill is
            // the only persistent glass pane on this page.
            className="flex min-h-[112px] flex-col justify-end rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] p-6 transition-[transform,border-color,box-shadow] duration-[320ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:border-[var(--accent)] hover:shadow-[0_0_32px_-4px_var(--accent-soft)] md:min-h-[160px]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xl font-semibold text-[var(--label-primary)]">
                {category.label}
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

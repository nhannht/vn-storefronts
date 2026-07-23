import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { listProducts } from "@/lib/medusa";
import { catalogAuthors } from "@/lib/authors";
import { ProductCard } from "@/components/product-card";
import { AuthorStrip } from "@/components/author-strip";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tp = await getTranslations("products");

  const region = await getRegion(locale as Locale);
  const products = region ? await listProducts(region.id) : [];
  const featured = products.slice(0, 3);
  // Doors come from the WHOLE catalog, not the featured slice: an author whose
  // books all sit outside the top three still needs a door.
  const authors = catalogAuthors(products);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      {/* Sections carry no vertical padding of their own. This single gap is the
          locked home rhythm - 64px mobile, 112px desktop - so there is one place
          to read it and one place to change it. */}
      <div className="flex flex-col gap-16 sm:gap-28">
        {/* Paper hero, still: no ambient glow, no WebGL - mot's light is the page
            gradient behind it, not an effect. */}
        <section className="flex flex-col items-center py-12 text-center sm:py-16">
          <p className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-[var(--label-primary)]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.5] text-[var(--label-secondary)]">
            {t("subtitle")}
          </p>
          <div className="mt-9">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--cta-fill)] px-6 py-3 text-sm font-semibold text-[var(--cta-label)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.985]"
            >
              {t("cta")}
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
                {t("featuredTitle")}
              </h2>
              <p className="mt-2 text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
                {t("featuredSubtitle")}
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-[1.0625rem] leading-[1.47] text-[var(--accent)] transition-opacity duration-200 hover:opacity-80"
            >
              {t("viewAll")}
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {featured.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
              {tp("empty")}
            </p>
          )}
        </section>

        <AuthorStrip authors={authors} />
      </div>
    </div>
  );
}

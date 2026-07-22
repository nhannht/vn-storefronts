import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { listProducts } from "@/lib/medusa";
import { catalogCategories } from "@/lib/product-view";
import { ProductCard } from "@/components/product-card";
import { AmbientGlow } from "@/components/ambient-glow";
import { CtaLink } from "@/components/cta-button";
import { CategoryStrip } from "@/components/category-strip";

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
  // Doors come from the WHOLE catalog, not the featured slice: a category whose
  // products all sit outside the top three still needs one.
  const categories = catalogCategories(products, locale);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      {/* Sections carry no vertical padding of their own. This single gap is
          the locked home rhythm - 64px mobile, 112px desktop - so there is one
          place to read it and one place to change it. */}
      <div className="flex flex-col gap-16 sm:gap-28">
        {/* The hero's own padding is its stage, not rhythm: it is the vertical
            room the ambient glow needs to read as light rather than as a band
            behind the headline. It is symmetric because the glow canvas IS this
            section's box - cutting the bottom padding clips the falloff right
            at the CTA and squashes the glow into an ellipse. */}
        <section className="relative flex flex-col items-center overflow-hidden py-16 text-center sm:py-24">
          {/* Baked-noise gold ambient glow behind the hero copy. */}
          <AmbientGlow />
          <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-[var(--accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-3xl text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.015em] text-[var(--label-primary)]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
            {t("subtitle")}
          </p>
          <div className="mt-8">
            <CtaLink href="/products">{t("cta")}</CtaLink>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
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
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-[1.0625rem] leading-[1.47] text-[var(--label-secondary)]">
              {tp("empty")}
            </p>
          )}
        </section>

        <CategoryStrip categories={categories} />
      </div>
    </div>
  );
}

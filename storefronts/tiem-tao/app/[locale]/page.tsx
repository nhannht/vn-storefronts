import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { listProducts } from "@/lib/medusa";
import { ProductCard } from "@/components/product-card";
import { OrbHero } from "@/components/orb-hero";
import { SpecularCta } from "@/components/specular-cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tp = await getTranslations("products");
  const tpdp = await getTranslations("pdp");

  const region = await getRegion(locale as Locale);
  const products = region ? await listProducts(region.id) : [];
  const featured = products.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="relative flex flex-col items-center overflow-hidden py-24 text-center sm:py-32">
        {/* Signature WebGL Orb behind the hero copy. */}
        <OrbHero />
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--label-primary)] sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--label-secondary)] sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-9">
          <SpecularCta href="/products">{t("cta")}</SpecularCta>
        </div>
      </section>

      <section className="py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--label-primary)]">
              {t("featuredTitle")}
            </h2>
            <p className="mt-2 text-sm text-[var(--label-secondary)]">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Link
            href="/products"
            className="shrink-0 text-sm text-[var(--accent)] transition-opacity duration-200 hover:opacity-80"
          >
            {t("viewAll")}
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                fromLabel={tp("from")}
                installmentLabel={tpdp("installmentTitle")}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-[var(--label-secondary)]">
            {tp("empty")}
          </p>
        )}
      </section>
    </div>
  );
}

import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { listProducts } from "@/lib/medusa";
import { ProductsBrowser, ProductsListing } from "@/components/products-browser";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");

  const region = await getRegion(locale as Locale);
  const products = region ? await listProducts(region.id) : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
          {t("subtitle")}
        </p>
      </header>

      {products.length > 0 ? (
        // The browser reads ?author=, which no build-time render can know. The
        // boundary confines that read so the route still prerenders, and the
        // fallback is the real unfiltered listing rather than a skeleton - so
        // the prerendered HTML is the full catalog, and the unfiltered visit
        // (every visit that is not an author deep link) never flashes.
        <Suspense fallback={<ProductsListing products={products} active={null} />}>
          <ProductsBrowser products={products} />
        </Suspense>
      ) : (
        <p className="mt-10 text-sm text-[var(--label-secondary)]">{t("empty")}</p>
      )}
    </div>
  );
}

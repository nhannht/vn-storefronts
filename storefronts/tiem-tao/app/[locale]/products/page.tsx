import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { listProducts } from "@/lib/medusa";
import { ProductCard } from "@/components/product-card";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const tpdp = await getTranslations("pdp");

  const region = await getRegion(locale as Locale);
  const products = region ? await listProducts(region.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--label-primary)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-base text-[var(--label-secondary)]">
          {t("subtitle")}
        </p>
      </header>

      {products.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              fromLabel={t("from")}
              installmentLabel={tpdp("installmentTitle")}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-[var(--label-secondary)]">{t("empty")}</p>
      )}
    </div>
  );
}

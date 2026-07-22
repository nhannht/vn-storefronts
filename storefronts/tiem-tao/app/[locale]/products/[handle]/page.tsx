import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { getProductByHandle } from "@/lib/medusa";
import { PdpPurchase } from "@/components/pdp-purchase";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pdp");
  const region = await getRegion(locale as Locale);
  const product = region ? await getProductByHandle(handle, region.id) : undefined;
  if (!product) notFound();

  // Core fields are EN; Vietnamese copy rides in metadata.
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  const title =
    locale === "vi" && typeof meta.title_vi === "string"
      ? meta.title_vi
      : product.title;
  const description =
    locale === "vi" && typeof meta.description_vi === "string"
      ? meta.description_vi
      : product.description;
  const initial = title?.trim().charAt(0) ?? "";
  const options = product.options ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 pb-32">
      <div className="grid gap-10 lg:grid-cols-2">
        <div
          className="grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)]"
          style={{ backgroundImage: "var(--vignette)" }}
        >
          <span
            aria-hidden="true"
            className="text-[8rem] font-semibold leading-none text-[var(--label-tertiary)]"
          >
            {initial}
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--label-primary)] sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-[var(--label-secondary)]">
              {description}
            </p>
          )}
          <div className="mt-8">
            <PdpPurchase product={product} />
          </div>
        </div>
      </div>

      {options.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--label-primary)]">
            {t("specs")}
          </h2>
          <dl className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)]">
            {options.map((option, i) => (
              <div
                key={option.id}
                className={
                  i > 0
                    ? "flex gap-6 border-t border-[var(--hairline)] px-5 py-4"
                    : "flex gap-6 px-5 py-4"
                }
              >
                <dt className="w-32 shrink-0 text-sm text-[var(--label-tertiary)]">
                  {option.title}
                </dt>
                <dd className="text-sm text-[var(--label-primary)]">
                  {Array.from(
                    new Set((option.values ?? []).map((v) => v.value)),
                  ).join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

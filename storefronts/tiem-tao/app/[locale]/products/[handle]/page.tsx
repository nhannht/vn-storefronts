import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { getProductByHandle, listProducts } from "@/lib/medusa";
import { PdpPurchase } from "@/components/pdp-purchase";

// The catalog is build-time frozen everywhere else - /products is already SSG -
// so the PDP is frozen too rather than being the one page that phones the
// backend on every request. The parent [locale] segment generates its params
// first, so this runs once per locale and asks that locale's region which
// products it actually sells.
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const region = await getRegion(params.locale as Locale);
  if (!region) return [];
  const products = await listProducts(region.id);
  return products.map((product) => ({ handle: product.handle }));
}

// This is what makes a bad handle answer correctly, and it is the whole reason
// the route was frozen. Left at its default (true), an unknown handle renders on
// demand and hits the notFound() below WHILE React is streaming HTML; the server
// renderer has no error-boundary recovery mid-stream, so Next abandons the
// stream, answers with a blank <html id="__next_error__"> shell, and the panel is
// rebuilt on the client from the flight payload. Turned off, an unknown handle
// never reaches this component at all: the router rejects the param and takes
// the route-level 404 path, which renders as real server HTML.
export const dynamicParams = false;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pdp");
  const region = await getRegion(locale as Locale);
  const product = region
    ? await getProductByHandle(handle, region.id)
    : undefined;
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
    <div className="mx-auto max-w-[1200px] px-4 py-16 pb-36 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery: main 1:1 + thumbnail row (vignette placeholders until real
            device photos land). */}
        <div className="flex flex-col gap-4">
          <div
            className="grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] p-[12%]"
            style={{ backgroundImage: "var(--vignette)" }}
          >
            <span
              aria-hidden="true"
              className="text-[8rem] font-semibold leading-none text-[var(--label-tertiary)]"
            >
              {initial}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                className="aspect-square rounded-[var(--radius-button)] border border-[var(--hairline)]"
                style={{ backgroundImage: "var(--vignette)" }}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
              {description}
            </p>
          )}
          <div className="mt-8">
            <PdpPurchase product={product} title={title ?? ""} />
          </div>
        </div>
      </div>

      {options.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--label-primary)]">
            {t("specs")}
          </h2>
          <dl className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)]">
            {options.map((option, i) => {
              // Localize the axis label through the same path as the variant
              // controls (EN core field -> vi label); unmapped axes keep their
              // core title.
              const key = option.title?.toLowerCase();
              const label =
                key === "storage"
                  ? t("storage")
                  : key === "color"
                    ? t("color")
                    : option.title;
              return (
              <div
                key={option.id}
                className={
                  i > 0
                    ? "flex gap-6 border-t border-[var(--hairline)] px-5 py-4"
                    : "flex gap-6 px-5 py-4"
                }
              >
                <dt className="w-32 shrink-0 text-sm text-[var(--label-tertiary)]">
                  {label}
                </dt>
                <dd className="text-sm text-[var(--label-primary)]">
                  {Array.from(
                    new Set((option.values ?? []).map((v) => v.value)),
                  ).join(", ")}
                </dd>
              </div>
              );
            })}
          </dl>
        </section>
      )}
    </div>
  );
}

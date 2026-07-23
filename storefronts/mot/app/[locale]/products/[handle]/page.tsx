import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { getProductByHandle, listProducts } from "@/lib/medusa";
import { localizedExcerpt, localizedTitle } from "@/lib/product-view";
import { authorHref, authorSlug, productAuthor } from "@/lib/authors";
import { BookCover } from "@/components/book-cover";
import { PdpPurchase } from "@/components/pdp-purchase";

// The listing assigns cover tints by render index, which is not stable per book
// across catalog order, so the PDP derives its own stable pick from the handle.
// The tint is decorative, so any deterministic spread across the three washes
// will do.
const COVER_TINTS = ["--cover-1", "--cover-2", "--cover-3"] as const;

function tintForHandle(handle: string): string {
  let sum = 0;
  for (let i = 0; i < handle.length; i++) sum += handle.charCodeAt(i);
  return COVER_TINTS[sum % COVER_TINTS.length];
}

// The catalog is build-time frozen everywhere else - the listing is already SSG -
// so the PDP is frozen too rather than being the one page that phones the backend
// on every request. The parent [locale] segment generates its params first, so
// this runs once per locale and asks that locale's region which books it sells.
// (params here is the RESOLVED parent object, not a Promise - unlike the page
// component below.)
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

// An unknown handle must 404 as real server HTML. Left dynamic (the default),
// notFound() fires WHILE React streams and Next abandons the stream for a blank
// error shell. Frozen, the router rejects the unknown param before this component
// runs and takes the route-level 404 path, which renders as real server HTML.
export const dynamicParams = false;

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pdp");
  const brand = await getTranslations("brand");
  const region = await getRegion(locale as Locale);
  const product = region
    ? await getProductByHandle(handle, region.id)
    : undefined;
  if (!product) notFound();

  // Core fields are EN; the Vietnamese title/excerpt ride in metadata. The
  // description has no shared helper, so its locale lookup is inline here (like
  // tiem-tao's PDP) rather than widening lib/product-view.
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  const title = localizedTitle(product, locale);
  const description =
    locale === "vi" && typeof meta.description_vi === "string"
      ? meta.description_vi
      : (product.description ?? undefined);
  const excerpt = localizedExcerpt(product, locale);
  const author = productAuthor(product);
  const tint = tintForHandle(product.handle ?? handle);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: the book itself - the typographic cover, then the reading
            preview. */}
        <div className="flex flex-col gap-10">
          <BookCover
            author={author}
            title={title}
            brandName={brand("name")}
            tint={tint}
            size="lg"
            titleTag="span"
          />

          {excerpt && (
            <section className="rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] px-6 py-8 sm:px-8 sm:py-10">
              {/* A styled label, not a heading: the cover column renders before
                  the title column in source, so keeping this a <p> leaves the
                  page's single <h1> (the title) unpreceded by a lower heading. */}
              <p className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                {t("sampleTitle")}
              </p>
              {/* The book's own opening lines, set in serif so the block reads
                  like a page. pre-line preserves the Kiều verse's line breaks. */}
              <p
                className="mt-5 font-serif text-[1.1875rem] leading-[1.9] text-[var(--label-primary)]"
                style={{ whiteSpace: "pre-line" }}
              >
                {excerpt}
              </p>
            </section>
          )}
        </div>

        {/* RIGHT: author link into the listing, title, description, purchase. */}
        <div className="flex flex-col">
          {author && (
            <Link
              href={authorHref(authorSlug(author))}
              className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-[var(--accent)] transition-opacity duration-200 hover:opacity-80"
            >
              {author}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-[var(--label-primary)]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-[var(--label-secondary)]">
              {description}
            </p>
          )}
          <div className="mt-8">
            <PdpPurchase product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

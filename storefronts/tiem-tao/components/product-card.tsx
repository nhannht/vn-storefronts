import type { HttpTypes } from "@medusajs/types";
import { Link } from "@/i18n/navigation";
import { fromAmount } from "@/lib/medusa";
import { formatPrice } from "@/lib/format";

// Paper rest that lifts on hover (scale + brighter hairline). The image slot is
// an intentional gold vignette placeholder until real device photos land.
export function ProductCard({
  product,
  fromLabel,
  installmentLabel,
}: {
  product: HttpTypes.StoreProduct;
  fromLabel: string;
  installmentLabel: string;
}) {
  const price = fromAmount(product);
  const initial = product.title?.trim().charAt(0) ?? "";
  const eyebrow = product.collection?.title;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--paper)] transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-[var(--accent)]"
    >
      <div
        className="relative grid aspect-square place-items-center"
        style={{ backgroundImage: "var(--vignette)" }}
      >
        <span
          aria-hidden="true"
          className="text-6xl font-semibold text-[var(--label-tertiary)] transition-transform duration-500 ease-out group-hover:scale-105"
        >
          {initial}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 p-5">
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-[var(--label-tertiary)]">
            {eyebrow}
          </p>
        )}
        <h3 className="text-base font-medium tracking-tight text-[var(--label-primary)]">
          {product.title}
        </h3>
        {price && (
          <p className="text-sm text-[var(--label-secondary)]">
            <span className="text-[var(--label-tertiary)]">{fromLabel} </span>
            <span className="text-[var(--label-primary)]">
              {formatPrice(price.amount, price.currency)}
            </span>
          </p>
        )}
        <span className="mt-2 inline-flex w-fit rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
          {installmentLabel}
        </span>
      </div>
    </Link>
  );
}

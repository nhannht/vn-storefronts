import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Paper rest: the footer sits flat on the page, never glass.
// The id is a stable handle for the PDP buy bar, which hides itself once this
// element enters view. It is an id and not a tag lookup because a second
// <footer> anywhere in the tree would silently capture querySelector("footer").
export async function Footer() {
  const t = await getTranslations("footer");
  const brand = await getTranslations("brand");
  const nav = await getTranslations("nav");

  return (
    <footer id="tt-footer" className="mt-24 border-t border-[var(--hairline)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div className="max-w-xs">
          <p className="text-lg font-semibold tracking-tight text-[var(--label-primary)]">
            {brand("name")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--label-secondary)]">
            {brand("disclaimer")}
          </p>
        </div>

        <nav aria-label={t("shop")} className="flex flex-col gap-2.5 text-sm">
          <p className="text-xs uppercase tracking-widest text-[var(--label-tertiary)]">
            {t("shop")}
          </p>
          <Link
            href="/products"
            className="text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]"
          >
            {nav("products")}
          </Link>
          <Link
            href="/cart"
            className="text-[var(--label-secondary)] transition-colors duration-200 hover:text-[var(--label-primary)]"
          >
            {nav("cart")}
          </Link>
        </nav>

        <nav aria-label={t("info")} className="flex flex-col gap-2.5 text-sm">
          <p className="text-xs uppercase tracking-widest text-[var(--label-tertiary)]">
            {t("info")}
          </p>
          <span className="text-[var(--label-secondary)]">{t("about")}</span>
          <span className="text-[var(--label-secondary)]">{t("warranty")}</span>
          <span className="text-[var(--label-secondary)]">{t("support")}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <p className="text-xs text-[var(--label-tertiary)]">{t("rights")}</p>
      </div>
    </footer>
  );
}

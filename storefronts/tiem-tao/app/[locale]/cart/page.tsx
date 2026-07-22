import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/cart-view";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.01em] text-[var(--label-primary)]">
        {t("title")}
      </h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}

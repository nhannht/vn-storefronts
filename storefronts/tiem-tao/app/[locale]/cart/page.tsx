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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--label-primary)] sm:text-4xl">
        {t("title")}
      </h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}

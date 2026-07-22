import { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";

// Fields we need for cards and PDP: calculated prices, variants + options,
// images, and the bilingual metadata (title_vi / description_vi).
const PRODUCT_FIELDS =
  "*variants.calculated_price,*variants.options,*options,*options.values,*images,*categories,+metadata";

export async function listProducts(
  regionId: string,
  limit = 50
): Promise<HttpTypes.StoreProduct[]> {
  const { products } = await sdk.store.product.list({
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit,
  });
  return products;
}

export async function getProductByHandle(
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | undefined> {
  const { products } = await sdk.store.product.list({
    handle,
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit: 1,
  });
  return products[0];
}

// Cheapest variant calculated amount, used for the "from" price on cards.
export function fromAmount(
  product: HttpTypes.StoreProduct
): { amount: number; currency: string } | undefined {
  const prices =
    product.variants
      ?.map((v) => v.calculated_price)
      .filter((p): p is NonNullable<typeof p> => Boolean(p)) ?? [];
  if (!prices.length) return undefined;
  const cheapest = prices.reduce((a, b) =>
    (a.calculated_amount ?? Infinity) < (b.calculated_amount ?? Infinity)
      ? a
      : b
  );
  return {
    amount: cheapest.calculated_amount ?? 0,
    currency: cheapest.currency_code ?? "usd",
  };
}

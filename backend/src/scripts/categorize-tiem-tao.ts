import { MedusaContainer } from "@medusajs/framework";
import { categorizeProducts } from "./_helpers";
import { CATEGORIES, PRODUCT_CATEGORY } from "./seed-tiem-tao";

// One-off, idempotent: bring the already-seeded tiem-tao catalog up to the
// current data model by creating the device-type categories and linking the
// live products to them. Avoids a destructive reseed (which would regenerate
// the sales-channel publishable keys). Run with:
//   mise exec node@24 -- bunx medusa exec ./src/scripts/categorize-tiem-tao.ts
export default async function categorizeTiemTao({
  container,
}: {
  container: MedusaContainer;
}) {
  await categorizeProducts(container, CATEGORIES, PRODUCT_CATEGORY);
}

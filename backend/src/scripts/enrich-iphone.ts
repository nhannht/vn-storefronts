import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  deleteProductsWorkflow,
  deleteReservationsWorkflow,
} from "@medusajs/medusa/core-flows";
import { seedCatalog, categorizeProducts } from "./_helpers";
import { PRODUCTS, CATEGORIES, PRODUCT_CATEGORY } from "./seed-tiem-tao";

// One-off, idempotent, one-product only: give iphone-15-pro a second variant
// axis (Color x Storage, 4 variants) so its PDP shows two segmented controls.
// Re-runnable: exits if the Storage axis is already present. Deletes and
// recreates ONLY the iPhone (scoped to the tiem-tao channel) - no full reseed,
// so the sales-channel publishable keys never churn. Run with:
//   mise exec node@24 -- bunx medusa exec ./src/scripts/enrich-iphone.ts
export default async function enrichIphone({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "options.title"],
    filters: { handle: ["iphone-15-pro"] },
  });
  const current = existing[0];
  if (!current) {
    logger.info("iphone-15-pro not found; run seed-tiem-tao first.");
    return;
  }

  const hasStorage = (current.options ?? []).some(
    (o: { title?: string }) => (o.title ?? "").toLowerCase() === "storage",
  );
  if (hasStorage) {
    logger.info("iphone-15-pro already has a Storage axis; nothing to do.");
    return;
  }

  const iphone = PRODUCTS.find((p) => p.handle === "iphone-15-pro");
  if (!iphone) {
    logger.info("iphone-15-pro definition missing from the seed.");
    return;
  }

  // Clear any leftover inventory reservations on the iPhone's variants (test
  // checkout cruft) so the product delete is not blocked.
  const { data: vlinks } = await query.graph({
    entity: "product_variant",
    fields: ["id", "inventory_items.inventory_item_id"],
    filters: { product_id: current.id as string },
  });
  const invIds = vlinks
    .flatMap((v: { inventory_items?: { inventory_item_id?: string }[] }) =>
      (v.inventory_items ?? []).map((x) => x.inventory_item_id),
    )
    .filter((x): x is string => Boolean(x));
  if (invIds.length) {
    const { data: reservations } = await query.graph({
      entity: "reservation",
      fields: ["id"],
      filters: { inventory_item_id: invIds },
    });
    if (reservations.length) {
      await deleteReservationsWorkflow(container).run({
        input: { ids: reservations.map((r: { id: string }) => r.id) },
      });
      logger.info(`Cleared ${reservations.length} iPhone reservation(s).`);
    }
  }

  await deleteProductsWorkflow(container).run({
    input: { ids: [current.id as string] },
  });
  await seedCatalog(container, "tiem-tao", [iphone]);
  await categorizeProducts(container, CATEGORIES, {
    "iphone-15-pro": PRODUCT_CATEGORY["iphone-15-pro"],
  });

  logger.info(
    `Enriched iphone-15-pro: ${iphone.options.length} axes, ${iphone.variants.length} variants.`,
  );
}

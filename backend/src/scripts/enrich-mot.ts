import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import { PRODUCTS } from "./seed-mot";

// One-off, idempotent, metadata-only: refresh the mot books' metadata to the
// current seed definition (adds excerpt_vi / excerpt_en for the PDP reading
// preview). Uses updateProductsWorkflow, so it never deletes a product, never
// creates a duplicate, and never re-runs foundation - the sales-channel
// publishable keys never churn. Safe to re-run. Run with:
//   mise exec node@24 -- bunx medusa exec ./src/scripts/enrich-mot.ts
export default async function enrichMot({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const handles = PRODUCTS.map((p) => p.handle);
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  });

  const idByHandle = new Map<string, string>(
    existing.map((p) => [p.handle as string, p.id as string]),
  );

  const updates = PRODUCTS.map((p) => {
    const id = idByHandle.get(p.handle);
    return id ? { id, metadata: p.metadata } : null;
  }).filter((u): u is { id: string; metadata: Record<string, string> } =>
    Boolean(u),
  );

  if (!updates.length) {
    logger.info("No mot products found; run seed-mot first.");
    return;
  }

  await updateProductsWorkflow(container).run({
    input: { products: updates },
  });

  logger.info(
    `Enriched ${updates.length} mot product(s) with the current seed metadata (excerpt_vi / excerpt_en).`,
  );
}

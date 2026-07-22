import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

// A single price line. VND is zero-decimal (amount = whole dong), USD has two
// decimals (amount = dollars). Medusa formats each by the currency's digits.
export type SeedPrice = {
  currency_code: "vnd" | "usd";
  amount: number;
};

export type SeedVariant = {
  title: string;
  sku: string;
  options: Record<string, string>;
  prices: SeedPrice[];
};

export type SeedProduct = {
  title: string;
  handle: string;
  description: string;
  weight?: number;
  // English lives in the core fields above. Vietnamese lives in metadata keys
  // (title_vi, description_vi) until the storefronts adopt a translation layer.
  metadata: Record<string, string>;
  options: { title: string; values: string[] }[];
  variants: SeedVariant[];
};

// Creates a store's catalog: resolves the store's sales channel by name, the
// default shipping profile and stock location, creates the products scoped to
// that one channel, and stocks every new variant at the warehouse.
export async function seedCatalog(
  container: MedusaContainer,
  channelName: string,
  products: SeedProduct[]
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const channel = channels.find((c) => c.name === channelName);
  if (!channel) {
    throw new Error(
      `Sales channel "${channelName}" not found. Run seed-foundation first.`
    );
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = stockLocations[0];

  const { result: created } = await createProductsWorkflow(container).run({
    input: {
      products: products.map((p) => ({
        title: p.title,
        handle: p.handle,
        description: p.description,
        weight: p.weight ?? 500,
        status: ProductStatus.PUBLISHED,
        metadata: p.metadata,
        shipping_profile_id: shippingProfile.id,
        options: p.options,
        variants: p.variants.map((v) => ({
          title: v.title,
          sku: v.sku,
          options: v.options,
          prices: v.prices,
        })),
        sales_channels: [{ id: channel.id }],
      })),
    },
  });

  const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
    filters: { sku: skus },
  });

  if (inventoryItems.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          inventory_item_id: item.id,
          stocked_quantity: 1000,
        })),
      },
    });
  }

  logger.info(
    `Seeded ${created.length} products (${skus.length} variants) into "${channelName}".`
  );
}

// A product category. name is the canonical English label; name_vi is the
// Vietnamese label the storefront reads from metadata (same bilingual pattern
// as title_vi on products).
export type SeedCategory = {
  name: string;
  name_vi?: string;
};

// Idempotently ensures the given categories exist (matched by name), then links
// each product (by handle) to its category. Safe to re-run: missing categories
// are created, existing ones reused, and the category assignment is an upsert.
// Called after a fresh seed and by the one-off categorize script, so the live
// catalog gains categories without a destructive reseed (which would regenerate
// the publishable keys).
export async function categorizeProducts(
  container: MedusaContainer,
  categories: SeedCategory[],
  handleToCategory: Record<string, string>
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const idByName = new Map<string, string>(
    existing.map((c) => [c.name as string, c.id as string])
  );

  const missing = categories.filter((c) => !idByName.has(c.name));
  if (missing.length) {
    const { result: created } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: missing.map((c) => ({
          name: c.name,
          is_active: true,
          metadata: c.name_vi ? { name_vi: c.name_vi } : undefined,
        })),
      },
    });
    for (const c of created) idByName.set(c.name as string, c.id as string);
  }

  const handles = Object.keys(handleToCategory);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  });

  const updates = products
    .map((p) => {
      const catId = idByName.get(handleToCategory[p.handle as string]);
      return catId ? { id: p.id as string, category_ids: [catId] } : null;
    })
    .filter((u): u is { id: string; category_ids: string[] } => Boolean(u));

  if (updates.length) {
    await updateProductsWorkflow(container).run({
      input: { products: updates },
    });
  }

  logger.info(
    `Categorized ${updates.length} products across ${categories.length} categories.`
  );
}

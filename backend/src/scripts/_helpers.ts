import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
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

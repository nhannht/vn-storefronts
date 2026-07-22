import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

// Countries served by the INTL (USD) region.
const INTL_COUNTRIES = ["us", "gb", "au", "sg", "ca", "de", "fr", "jp"];
const ALL_COUNTRIES = ["vn", ...INTL_COUNTRIES];

const STOREFRONTS = [
  { channel: "tiem-tao", label: "Tiem Tao - Apple reseller (luxury)" },
  { channel: "remart", label: "ReMart - grocery (mass-market)" },
  { channel: "mot", label: "Mot - bookstore (editorial)" },
];

export default async function seedFoundation({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("Seeding sales channels...");
  const { result: channels } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: STOREFRONTS.map((s) => ({
        name: s.channel,
        description: s.label,
      })),
    },
  });
  const channelByName = Object.fromEntries(channels.map((c) => [c.name, c]));

  logger.info("Seeding one publishable API key per storefront...");
  for (const s of STOREFRONTS) {
    const {
      result: [apiKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: `${s.channel} storefront`,
            type: "publishable",
            created_by: "seed-foundation",
          },
        ],
      },
    });
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [channelByName[s.channel].id] },
    });
    logger.info(`  ${s.channel}: ${apiKey.token}`);
  }

  logger.info("Seeding store (VND default, USD secondary)...");
  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "vn-storefronts",
          supported_currencies: [
            { currency_code: "vnd", is_default: true },
            { currency_code: "usd" },
          ],
          default_sales_channel_id: channelByName["tiem-tao"].id,
        },
      ],
    },
  });

  logger.info("Seeding regions (VN / VND and INTL / USD)...");
  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Vietnam",
          currency_code: "vnd",
          countries: ["vn"],
          // COD via the built-in manual/system payment provider.
          payment_providers: ["pp_system_default"],
        },
        {
          name: "International",
          currency_code: "usd",
          countries: INTL_COUNTRIES,
          // Stripe (test mode) - reads STRIPE_API_KEY from the env.
          payment_providers: ["pp_stripe_stripe"],
        },
      ],
    },
  });

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: ALL_COUNTRIES.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  logger.info("Seeding stock location...");
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Vietnam Warehouse",
          address: {
            city: "Ho Chi Minh City",
            country_code: "VN",
            address_1: "",
          },
        },
      ],
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: channels.map((c) => c.id) },
  });

  logger.info("Seeding fulfillment set and shipping option...");
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Vietnam Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Vietnam and International",
        geo_zones: ALL_COUNTRIES.map((country_code) => ({
          country_code,
          type: "country",
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-4 days.",
          code: "standard",
        },
        prices: [
          { currency_code: "vnd", amount: 30000 },
          { currency_code: "usd", amount: 10 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  logger.info("Foundation seed complete.");
}

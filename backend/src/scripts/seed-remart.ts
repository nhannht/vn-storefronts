import { MedusaContainer } from "@medusajs/framework";
import { seedCatalog, SeedProduct } from "./_helpers";

// ReMart: everyday Vietnamese grocery (dense, mass-market design).
// English lives in the core fields; Vietnamese lives in metadata.
const PRODUCTS: SeedProduct[] = [
  {
    title: "ST25 Rice 5kg",
    handle: "st25-rice-5kg",
    description: "Award-winning fragrant long-grain white rice. 5kg bag.",
    weight: 5000,
    metadata: {
      title_vi: "Gạo ST25 5kg",
      description_vi: "Gạo thơm hạt dài trắng, từng đoạt giải. Túi 5kg.",
    },
    options: [{ title: "Pack", values: ["5kg bag"] }],
    variants: [
      {
        title: "5kg bag",
        sku: "RM-RICE-ST25-5",
        options: { Pack: "5kg bag" },
        prices: [
          { currency_code: "vnd", amount: 185000 },
          { currency_code: "usd", amount: 12 },
        ],
      },
    ],
  },
  {
    title: "Phu Quoc Fish Sauce 500ml",
    handle: "phu-quoc-fish-sauce-500ml",
    description: "Traditional fish sauce from Phu Quoc island. 500ml bottle.",
    weight: 600,
    metadata: {
      title_vi: "Nước mắm Phú Quốc 500ml",
      description_vi: "Nước mắm truyền thống đảo Phú Quốc. Chai 500ml.",
    },
    options: [{ title: "Volume", values: ["500ml"] }],
    variants: [
      {
        title: "500ml",
        sku: "RM-FS-PQ-500",
        options: { Volume: "500ml" },
        prices: [
          { currency_code: "vnd", amount: 65000 },
          { currency_code: "usd", amount: 5 },
        ],
      },
    ],
  },
  {
    title: "Hot and Sour Shrimp Instant Noodles (30-pack)",
    handle: "instant-noodles-hot-sour-30",
    description:
      "Classic hot and sour shrimp instant noodles. Carton of 30 packs.",
    weight: 2700,
    metadata: {
      title_vi: "Mì tôm chua cay (thùng 30 gói)",
      description_vi: "Mì ăn liền vị tôm chua cay. Thùng 30 gói.",
    },
    options: [{ title: "Pack", values: ["Carton of 30"] }],
    variants: [
      {
        title: "Carton of 30",
        sku: "RM-NOODLE-HS-30",
        options: { Pack: "Carton of 30" },
        prices: [
          { currency_code: "vnd", amount: 120000 },
          { currency_code: "usd", amount: 8 },
        ],
      },
    ],
  },
];

export default async function seedRemart({
  container,
}: {
  container: MedusaContainer;
}) {
  await seedCatalog(container, "remart", PRODUCTS);
}

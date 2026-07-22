import { MedusaContainer } from "@medusajs/framework";
import {
  seedCatalog,
  categorizeProducts,
  SeedProduct,
  SeedCategory,
} from "./_helpers";

// Device-type categories for the listing filter. English name + Vietnamese
// label (metadata.name_vi), the same bilingual pattern as product title_vi.
export const CATEGORIES: SeedCategory[] = [
  { name: "Phones", name_vi: "Điện thoại" },
  { name: "Laptops", name_vi: "Máy tính" },
  { name: "Audio", name_vi: "Âm thanh" },
];

// Which category each product (by handle) belongs to.
export const PRODUCT_CATEGORY: Record<string, string> = {
  "iphone-15-pro": "Phones",
  "macbook-air-m3-13": "Laptops",
  "airpods-pro-2": "Audio",
};

// Tiem Tao: fictional-brand Apple reseller (luxury design system).
// Portfolio demo. Not affiliated with Apple Inc. Product names are used
// nominatively to describe resold devices; no Apple branding or imagery is
// used here. English lives in the core fields; Vietnamese lives in metadata.
const PRODUCTS: SeedProduct[] = [
  {
    title: "iPhone 15 Pro",
    handle: "iphone-15-pro",
    description:
      "Titanium design, A17 Pro chip, and a customizable Action button.",
    weight: 187,
    metadata: {
      title_vi: "iPhone 15 Pro",
      description_vi:
        "Thiết kế titan, chip A17 Pro và nút Tác vụ tùy chỉnh được.",
    },
    options: [{ title: "Color", values: ["Natural Titanium", "Blue Titanium"] }],
    variants: [
      {
        title: "Natural Titanium",
        sku: "TT-IP15P-NAT",
        options: { Color: "Natural Titanium" },
        prices: [
          { currency_code: "vnd", amount: 28990000 },
          { currency_code: "usd", amount: 1199 },
        ],
      },
      {
        title: "Blue Titanium",
        sku: "TT-IP15P-BLU",
        options: { Color: "Blue Titanium" },
        prices: [
          { currency_code: "vnd", amount: 28990000 },
          { currency_code: "usd", amount: 1199 },
        ],
      },
    ],
  },
  {
    title: "MacBook Air M3 13-inch",
    handle: "macbook-air-m3-13",
    description:
      "Strikingly thin laptop with the M3 chip and all-day battery life.",
    weight: 1240,
    metadata: {
      title_vi: "MacBook Air M3 13-inch",
      description_vi: "Laptop mỏng nhẹ với chip M3 và thời lượng pin cả ngày.",
    },
    options: [{ title: "Storage", values: ["256GB", "512GB"] }],
    variants: [
      {
        title: "256GB",
        sku: "TT-MBA-256",
        options: { Storage: "256GB" },
        prices: [
          { currency_code: "vnd", amount: 27990000 },
          { currency_code: "usd", amount: 1099 },
        ],
      },
      {
        title: "512GB",
        sku: "TT-MBA-512",
        options: { Storage: "512GB" },
        prices: [
          { currency_code: "vnd", amount: 33990000 },
          { currency_code: "usd", amount: 1299 },
        ],
      },
    ],
  },
  {
    title: "AirPods Pro (2nd generation)",
    handle: "airpods-pro-2",
    description:
      "Active Noise Cancellation, Adaptive Audio, and a USB-C charging case.",
    weight: 60,
    metadata: {
      title_vi: "AirPods Pro (thế hệ 2)",
      description_vi: "Chống ồn chủ động, Âm thanh thích ứng và hộp sạc USB-C.",
    },
    options: [{ title: "Connector", values: ["USB-C"] }],
    variants: [
      {
        title: "USB-C",
        sku: "TT-APP-USBC",
        options: { Connector: "USB-C" },
        prices: [
          { currency_code: "vnd", amount: 5990000 },
          { currency_code: "usd", amount: 249 },
        ],
      },
    ],
  },
];

export default async function seedTiemTao({
  container,
}: {
  container: MedusaContainer;
}) {
  await seedCatalog(container, "tiem-tao", PRODUCTS);
  await categorizeProducts(container, CATEGORIES, PRODUCT_CATEGORY);
}

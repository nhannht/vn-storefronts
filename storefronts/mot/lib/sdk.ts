import Medusa from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

// The publishable key scopes every request to the mot sales channel.
// It is read from the env (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY); keys regenerate
// on every backend reseed, so never hardcode a value here.
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === "development",
});

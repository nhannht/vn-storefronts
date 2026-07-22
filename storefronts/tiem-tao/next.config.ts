import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Product photos land in a later approved pass. Medusa serves any local
    // uploads from the backend on localhost:9000.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
};

export default withNextIntl(nextConfig);

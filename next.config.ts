import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@clerk/ui/themes/shadcn.css": "@clerk/ui/dist/themes/shadcn.css",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@clerk/ui/themes/shadcn.css": "@clerk/ui/dist/themes/shadcn.css",
    },
  },
};

export default nextConfig;

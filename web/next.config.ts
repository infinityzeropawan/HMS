import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/next/dist/compiled/source-map/**/*",
      "./node_modules/source-map/**/*",
    ],
  },
};

export default nextConfig;

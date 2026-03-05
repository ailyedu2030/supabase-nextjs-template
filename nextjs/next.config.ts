import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix: Explicitly set workspace root to avoid multi-lockfile warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

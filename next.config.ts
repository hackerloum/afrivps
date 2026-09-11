import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    // We run `tsc --noEmit` separately in CI; never silently ignore build errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Linting is a separate CI step; do not fail the build silently either.
    ignoreDuringBuilds: false,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

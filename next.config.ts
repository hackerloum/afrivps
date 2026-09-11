import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    // We run `tsc --noEmit` separately in CI; never silently ignore build errors.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

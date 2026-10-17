import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@masrfit/shared", "@masrfit/database"],
  typedRoutes: false,
};

export default nextConfig;

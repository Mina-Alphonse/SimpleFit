import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@simplefit/shared", "@simplefit/database"],
  typedRoutes: false,
};

export default nextConfig;

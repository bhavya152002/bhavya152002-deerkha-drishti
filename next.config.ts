import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For production deployment at /app
  basePath: process.env.NODE_ENV === 'production' ? '/app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/app' : '',

  // Ensure trailing slashes are handled correctly
  trailingSlash: false,

  // React compiler
  reactCompiler: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For production deployment at visionlogix.io/DeerkhaDrishti
  basePath: process.env.NODE_ENV === 'production' ? '/DeerkhaDrishti' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/DeerkhaDrishti' : '',

  // Ensure trailing slashes are handled correctly
  trailingSlash: false,

  // React compiler
  reactCompiler: true,
};

export default nextConfig;

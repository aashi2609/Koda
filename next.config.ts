import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: {
      tailwindcss: path.join(__dirname, "node_modules", "tailwindcss"),
      "@tailwindcss/postcss": path.join(__dirname, "node_modules", "@tailwindcss", "postcss"),
    },
  },
};

export default nextConfig;

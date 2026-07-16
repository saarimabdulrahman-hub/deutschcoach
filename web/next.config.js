/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Monorepo root for Next.js package resolution
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ["@tanstack/react-query", "recharts"],
  },
};

module.exports = nextConfig;

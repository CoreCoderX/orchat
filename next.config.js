/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {},
};

module.exports = nextConfig;

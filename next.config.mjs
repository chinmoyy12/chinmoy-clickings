import { createRequire } from "node:module";

// The image optimizer needs sharp. Where its native binary cannot load (for
// example under Windows Application Control), serve the sources directly
// instead of failing every image request. Hosted builds optimize as normal.
function hasSharp() {
  try {
    createRequire(import.meta.url)("sharp");
    return true;
  } catch {
    return false;
  }
}

const optimize = hasSharp();

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: { NEXT_PUBLIC_IMAGE_OPTIMIZER: optimize ? "1" : "0" },
  images: {
    unoptimized: !optimize,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1200, 1600, 2048, 2560],
    imageSizes: [96, 256, 384],
    qualities: [70, 80, 85],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;

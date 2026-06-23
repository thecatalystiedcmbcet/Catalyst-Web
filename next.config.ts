import type { NextConfig } from "next";

import withBundleAnalyzerInit from '@next/bundle-analyzer';

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Allow hot-reloading on your phone (192.168.1.3) over local network
  allowedDevOrigins: ['192.168.1.3'],

  // ─── Compression ────────────────────────────────────────────────────
  compress: true,

  // ─── Image optimization ──────────────────────────────────────────────
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // 1 hour
    // Allow all remote https image hostnames (e.g. for mock data)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ─── Experimental features ───────────────────────────────────────────
  cacheComponents: true,
  experimental: {
    // Optimize server-component imports (tree-shake large icon bundles)
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "react-icons"],
    viewTransition: true,
  },

  // ─── HTTP headers — Cache static assets aggressively ────────────────
  async headers() {
    return [
      {
        // Cache public static assets for 1 year
        source: "/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache 3D model and HDR assets aggressively — they are large and immutable
        source: "/(.*)\\.(glb|gltf|hdr|bin|exr)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

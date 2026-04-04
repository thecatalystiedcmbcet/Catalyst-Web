import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Compression ────────────────────────────────────────────────────
  compress: true,

  // ─── Image optimization ──────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // 1 hour
    // Allow remote image hostnames from your Appwrite bucket here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
    ],
  },

  // ─── Experimental features ───────────────────────────────────────────
  experimental: {
    // Optimize server-component imports (tree-shake large icon bundles)
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
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
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare R2 / Stream and Google avatar hosts. Extend as real hosts are wired.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestream.com" },
    ],
  },
};

export default nextConfig;

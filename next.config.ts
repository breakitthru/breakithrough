import type { NextConfig } from "next";

/*
  Security headers.

  These are applied in PRODUCTION only. A strict CSP breaks `next dev` (Hot
  Module Reload needs `eval` and websockets and injects unhashed inline code),
  so in development we send no CSP and rely on the local environment. `next
  start` runs with NODE_ENV=production, so you can verify the headers locally
  with `next build && next start`.

  CSP notes — what each allowance is for:
    • 'unsafe-inline' (script/style): Next.js injects inline hydration scripts
      and next/font injects an inline <style>. These can't be nonced without
      making every route dynamic, and Razorpay's checkout also injects inline
      code we can't hash — so inline is allowed. The remaining directives still
      block framing (clickjacking), external form posts, base-tag injection,
      and loading scripts/frames/data from unlisted origins.
    • Cloudflare Stream: iframe.videodelivery.net (playback), *.cloudflarestream
      / *.videodelivery.net (posters), upload.videodelivery.net (direct upload).
    • Razorpay: checkout.razorpay.com (loader script + frame), *.razorpay.com
      (API + checkout frame), lumberjack.razorpay.com (its analytics beacon).
    • Google: lh3.googleusercontent.com (avatar images for Google sign-in).
    • data:/blob: images — product/logo images are stored inline as data URIs,
      and admin image uploads preview via blob: object URLs.

  If Razorpay checkout ever throws a CSP error mentioning "eval" after it is
  wired, add 'unsafe-eval' to script-src.
*/
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.r2.dev https://*.cloudflarestream.com https://*.videodelivery.net https://*.razorpay.com",
  "font-src 'self' data:",
  "connect-src 'self' https://upload.videodelivery.net https://*.videodelivery.net https://*.cloudflarestream.com https://*.razorpay.com https://lumberjack.razorpay.com",
  "frame-src 'self' https://iframe.videodelivery.net https://*.videodelivery.net https://*.cloudflarestream.com https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
  "media-src 'self' blob: https://*.videodelivery.net https://*.cloudflarestream.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 2 years, apply to subdomains. HTTPS-only; browsers ignore it over http/localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Razorpay may open a popup and talk to it via window.opener, so allow popups.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Cloudflare R2 / Stream and Google avatar hosts. Extend as real hosts are wired.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestream.com" },
    ],
  },
  async headers() {
    if (!isProd) return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV !== "production"

// Artikel dirender di server dan sudah disanitasi; CSP ini lapisan kedua.
// 'unsafe-inline' untuk script diperlukan oleh skrip inline Next.js dan
// skrip tema tanpa memaksa semua halaman menjadi dinamis (nonce).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // API staging melayani artikel bergambar base64 (beberapa MB) dengan lambat;
  // beri waktu lebih dari default 60 detik saat prerender.
  staticPageGenerationTimeout: 300,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      // URL lama versi Vite: /documentation/:category/:article
      { source: "/documentation", destination: "/", permanent: true },
      { source: "/documentation/:path*", destination: "/:path*", permanent: true },
    ]
  },
}

export default nextConfig

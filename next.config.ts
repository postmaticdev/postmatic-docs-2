import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/documentation/:categorySlug/:articleSlug",
        destination: "/:categorySlug/:articleSlug",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

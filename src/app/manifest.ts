import type { MetadataRoute } from "next"

import { BRAND_COLOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site-config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "id",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND_COLOR,
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  }
}

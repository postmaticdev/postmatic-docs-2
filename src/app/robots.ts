import type { MetadataRoute } from "next"

import { ALLOW_INDEXING } from "@/lib/server-config"
import { SITE_URL } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    // Crawler mesin pencari dan asisten AI dipersilakan membaca dokumentasi publik.
    rules: { userAgent: "*", allow: "/", disallow: ["/search-index.json"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

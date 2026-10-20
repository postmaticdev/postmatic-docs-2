import type { MetadataRoute } from "next"

import { LOCALES, localizeHref } from "@/i18n/config"
import { getDocumentationIndex } from "@/lib/documentation-api"
import { getAllProcessedArticles } from "@/lib/documentation-content"
import { toIsoDate } from "@/lib/documentation-model"
import { SITE_URL } from "@/lib/site-config"

export const revalidate = 300

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates">

// Setiap halaman dicantumkan dalam kedua bahasa beserta pasangan hreflang-nya.
function localized(path: string, entry: Entry): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((lang) => [lang, `${SITE_URL}${localizeHref(lang, path)}`]))
  return LOCALES.map((lang) => ({
    url: `${SITE_URL}${localizeHref(lang, path)}`,
    alternates: { languages },
    ...entry,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories }, articles] = await Promise.all([getDocumentationIndex(), getAllProcessedArticles()])

  return [
    ...localized("/", { changeFrequency: "weekly", priority: 1 }),
    ...categories.flatMap((category) => localized(category.href, { changeFrequency: "weekly", priority: 0.6 })),
    ...articles.flatMap(({ meta, article }) =>
      localized(meta.href, {
        lastModified: toIsoDate(article.updatedAt ?? article.createdAt),
        changeFrequency: "weekly",
        priority: meta.type === "legality" ? 0.3 : 0.8,
      }),
    ),
  ]
}

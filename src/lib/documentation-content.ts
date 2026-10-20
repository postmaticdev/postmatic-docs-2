import "server-only"

import { unstable_cache } from "next/cache"
import { cache } from "react"

import {
  DOCUMENTATION_CACHE_TAG,
  DOCUMENTATION_REVALIDATE_SECONDS,
  getDocumentationArticle,
  getDocumentationIndex,
} from "@/lib/documentation-api"
import { processArticleHtml } from "@/lib/documentation-html"
import { convertToWebp } from "@/lib/documentation-media"
import type { DocumentationArticleMeta, RemoteDocumentation } from "@/lib/documentation-model"

async function loadProcessedArticle(categorySlug: string, articleSlug: string) {
  const article = await getDocumentationArticle(categorySlug, articleSlug)
  if (!article) return null

  const title = article.title?.trim() || articleSlug
  const { images, ...processed } = await processArticleHtml(article.article, title, {
    categorySlug,
    articleSlug,
  })
  const { article: _rawHtml, ...metadata } = article

  return {
    article: metadata as Omit<RemoteDocumentation, "article">,
    ...processed,
    imageHashes: [...images.keys()],
  }
}

// Respons API bisa > 2 MB (gambar base64) sehingga tidak masuk data cache fetch.
// Yang di-cache adalah hasil olahannya: kecil karena gambar sudah dipisah.
// Naikkan versi ini setiap kali output processArticleHtml berubah.
const PROCESSING_VERSION = "processed-article-v6"

const getCachedProcessedArticle = unstable_cache(loadProcessedArticle, [PROCESSING_VERSION], {
  revalidate: DOCUMENTATION_REVALIDATE_SECONDS,
  tags: [DOCUMENTATION_CACHE_TAG],
})

export const getProcessedArticle = cache(getCachedProcessedArticle)

// Satu entri cache per gambar (WebP base64, puluhan-ratusan KB) agar tidak ada
// entri yang melewati batas 2 MB. Nama file = hash isi, jadi tidak perlu revalidasi:
// artikel mentah hanya diunduh ulang saat gambar itu pertama kali diminta.
const getCachedImage = unstable_cache(
  async (categorySlug: string, articleSlug: string, hash: string) => {
    const article = await getDocumentationArticle(categorySlug, articleSlug)
    if (!article) return null

    const { images } = await processArticleHtml(article.article, article.title ?? articleSlug, {
      categorySlug,
      articleSlug,
    })
    const image = images.get(hash)
    return image ? (await convertToWebp(image)).toString("base64") : null
  },
  [`${PROCESSING_VERSION}-image`],
  { revalidate: false },
)

export type ProcessedArticle = NonNullable<Awaited<ReturnType<typeof loadProcessedArticle>>>

const CONCURRENCY = 4

export async function getAllProcessedArticles() {
  const { articles } = await getDocumentationIndex()
  const results: ({ meta: DocumentationArticleMeta } & ProcessedArticle)[] = []

  for (let start = 0; start < articles.length; start += CONCURRENCY) {
    const batch = await Promise.all(
      articles.slice(start, start + CONCURRENCY).map(async (meta) => {
        try {
          const processed = await getProcessedArticle(meta.categorySlug, meta.slug)
          return processed ? { meta, ...processed } : null
        } catch (error) {
          console.error(`[docs] Gagal memuat artikel ${meta.href}:`, error)
          return null
        }
      }),
    )
    results.push(...batch.filter((result): result is NonNullable<typeof result> => result !== null))
  }

  return results
}

export type SearchIndexEntry = Pick<
  DocumentationArticleMeta,
  "href" | "title" | "description" | "categoryName" | "type"
> & {
  sections: { id: string; title: string; text: string }[]
}

const SECTION_TEXT_LIMIT = 1500

export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const articles = await getAllProcessedArticles()

  return articles.map(({ meta, sections }) => ({
    href: meta.href,
    title: meta.title,
    description: meta.description,
    categoryName: meta.categoryName,
    type: meta.type,
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      text: section.text.slice(0, SECTION_TEXT_LIMIT),
    })),
  }))
}

// Hanya artikel yang tercantum di daftar isi yang dibaca, jadi URL acak tidak
// bisa memicu permintaan ke API untuk artikel sembarangan.
export async function findArticleMedia(categorySlug: string, articleSlug: string, hash: string) {
  const { articles } = await getDocumentationIndex()
  const listed = articles.some((article) => article.categorySlug === categorySlug && article.slug === articleSlug)
  if (!listed) return null

  const processed = await getProcessedArticle(categorySlug, articleSlug)
  if (!processed?.imageHashes.includes(hash)) return null

  const webp = await getCachedImage(categorySlug, articleSlug, hash)
  return webp ? Buffer.from(webp, "base64") : null
}

export async function listMediaParams() {
  return (await getAllProcessedArticles()).flatMap(({ meta, imageHashes }) =>
    imageHashes.map((hash) => ({
      categorySlug: meta.categorySlug,
      articleSlug: meta.slug,
      file: `${hash}.webp`,
    })),
  )
}

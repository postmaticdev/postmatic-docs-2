// Tipe dan helper murni (tanpa I/O) yang dipakai server maupun client.

export type DocumentationType = "information" | "legality"

export type HeadingItem = {
  id: string
  title: string
  level: number
}

export type DocumentationArticleMeta = {
  id: string
  slug: string
  title: string
  description: string
  type: DocumentationType
  categoryName: string
  categorySlug: string
  href: string
}

export type DocumentationCategory = {
  slug: string
  name: string
  type: DocumentationType
  href: string
  articles: DocumentationArticleMeta[]
}

export type DocumentationNavSection = {
  key: string
  title: string
  href: string
  type: DocumentationType
  items: { title: string; href: string }[]
}

export type RemoteDocumentationTocArticle = {
  id: number | string
  slug?: string | null
  title?: string | null
  description?: string | null
  icon?: string | null
  isActive?: boolean | null
}

export type RemoteDocumentationCategory = {
  id: number | string
  slug?: string | null
  name?: string | null
  type?: string | null
  isActive?: boolean | null
  documentations?: RemoteDocumentationTocArticle[] | null
}

export type RemoteDocumentation = {
  id: number | string
  slug?: string | null
  title?: string | null
  description?: string | null
  icon?: string | null
  article?: string | null
  type?: string | null
  category?: {
    id?: number | string | null
    slug?: string | null
    name?: string | null
    type?: string | null
  } | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

// Id elemen tetap di setiap halaman; heading artikel tidak boleh memakai id ini.
export const OVERVIEW_ID = "ikhtisar"
export const CONTACT_SECTION_ID = "hubungi-kami"
export const RESERVED_ELEMENT_IDS = ["top", "konten", OVERVIEW_ID, CONTACT_SECTION_ID, `${CONTACT_SECTION_ID}-judul`]

export const DOCUMENTATION_TYPE_LABEL: Record<DocumentationType, string> = {
  information: "Article Docs",
  legality: "Legality",
}

// Data API diperlakukan sebagai tidak tepercaya: nilai non-string atau non-array
// tidak boleh membuat build/render gagal.
function text(value: unknown) {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value)
  return ""
}

function list<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value.filter((item): item is T => Boolean(item) && typeof item === "object") : []
}

function isActive(value?: boolean | null) {
  return value !== false
}

export function slugify(value: string, fallback = "section") {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || fallback
}

export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function createCategoryHref(categorySlug: string) {
  return `/${encodeURIComponent(categorySlug)}`
}

export function createArticleHref(categorySlug: string, articleSlug: string) {
  return `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`
}

// Judul dari admin kadang ditulis huruf kecil semua ("terms & condition").
function tidyTitle(value: string) {
  return value === value.toLowerCase() ? value.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()) : value
}

export function buildDocumentationCategories(
  informationCategories: RemoteDocumentationCategory[],
  legalityCategories: RemoteDocumentationCategory[],
) {
  const seen = new Set<string>()

  const build = (categories: RemoteDocumentationCategory[], type: DocumentationType) =>
    list(categories).flatMap((category) => {
      const slug = text(category.slug)
      if (!slug || !isActive(category.isActive) || seen.has(slug)) return []
      seen.add(slug)

      const name = text(category.name) || DOCUMENTATION_TYPE_LABEL[type]
      const articleSlugs = new Set<string>()
      const articles = list(category.documentations).flatMap((item) => {
        const articleSlug = text(item.slug)
        if (!articleSlug || !isActive(item.isActive) || articleSlugs.has(articleSlug)) return []
        articleSlugs.add(articleSlug)

        return [
          {
            id: String(item.id),
            slug: articleSlug,
            title: tidyTitle(text(item.title) || "Untitled"),
            description: text(item.description),
            type,
            categoryName: name,
            categorySlug: slug,
            href: createArticleHref(slug, articleSlug),
          } satisfies DocumentationArticleMeta,
        ]
      })

      if (articles.length === 0) return []

      return [{ slug, name, type, href: createCategoryHref(slug), articles } satisfies DocumentationCategory]
    })

  return [...build(informationCategories, "information"), ...build(legalityCategories, "legality")]
}

export function buildNavigationSections(categories: DocumentationCategory[]): DocumentationNavSection[] {
  return categories.map((category) => ({
    key: `${category.type}:${category.slug}`,
    title: category.name,
    href: category.href,
    type: category.type,
    items: category.articles.map((article) => ({ title: article.title, href: article.href })),
  }))
}

export function findArticleNeighbors(
  articles: DocumentationArticleMeta[],
  categorySlug: string,
  articleSlug: string,
) {
  const index = articles.findIndex(
    (article) => article.categorySlug === categorySlug && article.slug === articleSlug,
  )

  return {
    previousArticle: index > 0 ? articles[index - 1] : null,
    nextArticle: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  }
}

export function formatDate(value?: string | null, locale = "id-ID") {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })
}

export function toIsoDate(value?: string | null) {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

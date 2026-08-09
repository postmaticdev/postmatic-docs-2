import type {
  DocumentationType,
  RemoteDocumentationCategory,
  RemoteDocumentationTocArticle,
} from "@/lib/documentation-types"

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
  icon: string
  type: DocumentationType
  typeLabel: string
  categoryName: string
  categorySlug: string
  href: string
}

export type DocumentationNavItem = {
  title: string
  href: string
  type: DocumentationType
  badge?: string
}

export type DocumentationNavSection = {
  title: string
  items: DocumentationNavItem[]
}

export const DOCUMENTATION_TYPE_LABEL: Record<DocumentationType, string> = {
  information: "Article Docs",
  legality: "Legality",
}

function isActive(value?: boolean | null) {
  return value !== false
}

export function slugify(value: string, fallback = "section") {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || fallback
}

export function createArticleHref(categorySlug: string, articleSlug: string) {
  return `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`
}

function mapTocArticle(
  item: RemoteDocumentationTocArticle,
  category: RemoteDocumentationCategory,
  type: DocumentationType,
) {
  const slug = item.slug?.trim()
  const categorySlug = category.slug?.trim()

  if (!slug || !categorySlug || !isActive(item.isActive)) return null

  return {
    id: String(item.id),
    slug,
    title: item.title?.trim() || "Untitled",
    description: item.description?.trim() || "",
    icon: item.icon?.trim() || "",
    type,
    typeLabel: DOCUMENTATION_TYPE_LABEL[type],
    categoryName: category.name?.trim() || "Uncategorized",
    categorySlug,
    href: createArticleHref(categorySlug, slug),
  } satisfies DocumentationArticleMeta
}

export function buildDocumentationArticles(
  informationCategories: RemoteDocumentationCategory[],
  legalityCategories: RemoteDocumentationCategory[],
) {
  const build = (categories: RemoteDocumentationCategory[], type: DocumentationType) =>
    categories
      .filter((category) => category.slug?.trim() && isActive(category.isActive))
      .flatMap((category) =>
        (category.documentations ?? [])
          .map((article) => mapTocArticle(article, category, type))
          .filter((article): article is DocumentationArticleMeta => Boolean(article)),
      )

  return [...build(informationCategories, "information"), ...build(legalityCategories, "legality")]
}

export function buildNavigationSections(
  informationCategories: RemoteDocumentationCategory[],
  legalityCategories: RemoteDocumentationCategory[],
) {
  const build = (categories: RemoteDocumentationCategory[], type: DocumentationType) =>
    categories
      .filter((category) => category.slug?.trim() && isActive(category.isActive))
      .map((category) => {
        const items = (category.documentations ?? [])
          .map((article) => mapTocArticle(article, category, type))
          .filter((article): article is DocumentationArticleMeta => Boolean(article))
          .map((article) => ({
            title: article.title,
            href: article.href,
            type,
          }))

        return {
          title: category.name?.trim() || DOCUMENTATION_TYPE_LABEL[type],
          items,
        } satisfies DocumentationNavSection
      })
      .filter((section) => section.items.length > 0)

  return [...build(informationCategories, "information"), ...build(legalityCategories, "legality")]
}

export function findSelectedArticle(
  articles: DocumentationArticleMeta[],
  categorySlug?: string,
  articleSlug?: string,
) {
  if (categorySlug && articleSlug) {
    return (
      articles.find(
        (article) => article.categorySlug === categorySlug && article.slug === articleSlug,
      ) ?? null
    )
  }

  if (categorySlug) {
    return articles.find((article) => article.categorySlug === categorySlug) ?? null
  }

  return articles[0] ?? null
}

export function findArticleNeighbors(
  articles: DocumentationArticleMeta[],
  selectedArticle: DocumentationArticleMeta | null,
) {
  if (!selectedArticle) return { previousArticle: null, nextArticle: null }

  const index = articles.findIndex(
    (article) =>
      article.categorySlug === selectedArticle.categorySlug && article.slug === selectedArticle.slug,
  )

  return {
    previousArticle: index > 0 ? articles[index - 1] : null,
    nextArticle: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  }
}

export function formatDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

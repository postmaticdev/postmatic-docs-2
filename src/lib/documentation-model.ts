import { FileText, ShieldCheck, type LucideIcon } from "lucide-react"

import type {
  DocumentationType,
  RemoteDocumentation,
  RemoteDocumentationCategory,
  RemoteDocumentationTocArticle,
} from "@/lib/documentation-api"

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
  icon?: LucideIcon
  badge?: string
}

export type DocumentationNavSection = {
  title: string
  items: DocumentationNavItem[]
}

export type RouteSelection = {
  categorySlug?: string
  articleSlug?: string
}

export const DOCUMENTATION_TYPE_LABEL: Record<DocumentationType, string> = {
  information: "Article Docs",
  legality: "Legality",
}

export const DOCUMENTATION_TYPE_ICON: Record<DocumentationType, LucideIcon> = {
  information: FileText,
  legality: ShieldCheck,
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
            icon: DOCUMENTATION_TYPE_ICON[type],
          }))

        return {
          title: category.name?.trim() || DOCUMENTATION_TYPE_LABEL[type],
          items,
        } satisfies DocumentationNavSection
      })
      .filter((section) => section.items.length > 0)

  return [...build(informationCategories, "information"), ...build(legalityCategories, "legality")]
}

export function readRouteSelection(pathname = window.location.pathname): RouteSelection {
  const segments = pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => decodeURIComponent(part))

  const normalizedSegments = segments[0] === "documentation" ? segments.slice(1) : segments

  return {
    categorySlug: normalizedSegments[0],
    articleSlug: normalizedSegments[1],
  }
}

export function findSelectedArticle(
  articles: DocumentationArticleMeta[],
  selection: RouteSelection,
) {
  if (selection.categorySlug && selection.articleSlug) {
    return (
      articles.find(
        (article) =>
          article.categorySlug === selection.categorySlug &&
          article.slug === selection.articleSlug,
      ) ?? null
    )
  }

  if (selection.categorySlug) {
    return articles.find((article) => article.categorySlug === selection.categorySlug) ?? null
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

export function prepareArticleHtml(article: RemoteDocumentation | null | undefined) {
  const sourceHtml = article?.article?.trim() || ""
  if (!sourceHtml) return { html: "", headings: [] as HeadingItem[] }

  const documentBody = new DOMParser().parseFromString(sourceHtml, "text/html").body

  documentBody.querySelectorAll("script").forEach((element) => element.remove())
  documentBody.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  const usedIds = new Set<string>()
  const headings = Array.from(documentBody.querySelectorAll("h2, h3")).map((element, index) => {
    const level = element.tagName.toLowerCase() === "h3" ? 3 : 2
    const title = element.textContent?.trim() || `Section ${index + 1}`
    const existingId = element.id.trim()
    const baseId = existingId || slugify(title, `section-${index + 1}`)
    let id = baseId
    let suffix = 2

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    usedIds.add(id)
    element.id = id

    return { id, title, level }
  })

  return {
    html: documentBody.innerHTML,
    headings,
  }
}

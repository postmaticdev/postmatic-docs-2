import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CalendarDays, FileText, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ArticlePager } from "@/components/docs/article-card"
import { DocsPage, PageHeader } from "@/components/docs/docs-page"
import { JsonLd } from "@/components/docs/json-ld"
import { DATE_LOCALE, OPEN_GRAPH_LOCALE, formatMessage, isLocale, localizeHref, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getDocumentationIndex } from "@/lib/documentation-api"
import { getProcessedArticle } from "@/lib/documentation-content"
import {
  createArticleHref,
  createCategoryHref,
  findArticleNeighbors,
  formatDate,
  safeDecode,
  toIsoDate,
} from "@/lib/documentation-model"
import { SITE_NAME, SITE_URL } from "@/lib/site-config"

export const revalidate = 300

type Props = { params: Promise<{ lang: string; categorySlug: string; articleSlug: string }> }

async function loadArticle(params: Props["params"]) {
  const { lang, categorySlug, articleSlug } = await params
  if (!isLocale(lang)) return null
  const category = safeDecode(categorySlug)
  const slug = safeDecode(articleSlug)

  // Hanya artikel yang tercantum di daftar isi yang diambil dari API, jadi URL
  // acak tidak memicu permintaan ke API maupun entri cache baru.
  const index = await getDocumentationIndex()
  const meta = index.articles.find((article) => article.categorySlug === category && article.slug === slug)
  if (!meta) return null

  const processed = await getProcessedArticle(category, slug)
  if (!processed || processed.article.isActive === false) return null

  const { article } = processed
  const type = article.type === "legality" || meta.type === "legality" ? "legality" : "information"

  return {
    ...processed,
    lang: lang as Locale,
    href: createArticleHref(category, slug),
    title: article.title?.trim() || meta.title || slug,
    description: article.description?.trim() || meta.description || "",
    categoryName: article.category?.name?.trim() || meta.categoryName || category,
    categoryHref: createCategoryHref(category),
    type,
    neighbors: findArticleNeighbors(index.articles, category, slug),
  } as const
}

export async function generateStaticParams() {
  const { articles } = await getDocumentationIndex()
  return articles.map((article) => ({ categorySlug: article.categorySlug, articleSlug: article.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadArticle(params)
  if (!data) return {}

  const dict = getDictionary(data.lang)
  const description = data.description || formatMessage(dict.article.metaDescription, { title: data.title })
  const url = localizeHref(data.lang, data.href)

  return {
    title: data.title,
    description,
    alternates: {
      canonical: url,
      languages: { id: data.href, en: localizeHref("en", data.href), "x-default": data.href },
    },
    openGraph: {
      type: "article",
      locale: OPEN_GRAPH_LOCALE[data.lang],
      url,
      title: data.title,
      description,
      section: data.categoryName,
      publishedTime: toIsoDate(data.article.createdAt),
      modifiedTime: toIsoDate(data.article.updatedAt),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: data.title }],
    },
    twitter: { card: "summary_large_image", title: data.title, description },
  }
}

export default async function ArticlePage({ params }: Props) {
  const data = await loadArticle(params)
  if (!data) notFound()

  const { lang } = data
  const dict = getDictionary(lang)
  const TypeIcon = data.type === "legality" ? ShieldCheck : FileText
  const updatedAt = data.article.updatedAt ?? data.article.createdAt
  const formattedDate = formatDate(updatedAt, DATE_LOCALE[lang])
  const url = `${SITE_URL}${localizeHref(lang, data.href)}`

  return (
    <DocsPage
      breadcrumbs={[
        { label: dict.nav.home, href: "/" },
        { label: data.categoryName, href: data.categoryHref },
        { label: data.title },
      ]}
      toc={data.headings}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: data.title,
            description: data.description || undefined,
            url,
            mainEntityOfPage: url,
            // Isi artikel selalu berbahasa Indonesia, juga di versi /en.
            inLanguage: "id-ID",
            articleSection: data.categoryName,
            datePublished: toIsoDate(data.article.createdAt),
            dateModified: toIsoDate(updatedAt),
            author: { "@type": "Organization", name: "Postmatic.id", url: "https://postmatic.id" },
            publisher: {
              "@type": "Organization",
              name: "Postmatic.id",
              url: "https://postmatic.id",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
            },
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${SITE_URL}${localizeHref(lang, "/")}` },
              {
                "@type": "ListItem",
                position: 2,
                name: data.categoryName,
                item: `${SITE_URL}${localizeHref(lang, data.categoryHref)}`,
              },
              { "@type": "ListItem", position: 3, name: data.title, item: url },
            ],
          },
        ]}
      />

      <article>
        <PageHeader
          eyebrow={
            <>
              <Badge variant="secondary" className="gap-1.5">
                <TypeIcon className="size-3.5" aria-hidden="true" />
                {dict.article.typeLabel[data.type]}
              </Badge>
              <Badge variant="outline">{data.categoryName}</Badge>
            </>
          }
          title={data.title}
          description={data.description}
        >
          {formattedDate ? (
            <p className="mt-6 flex items-center gap-2 border-y py-3 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {dict.article.lastUpdated} <time dateTime={toIsoDate(updatedAt)}>{formattedDate}</time>
            </p>
          ) : null}
        </PageHeader>

        {data.html ? (
          <div className="docs-content mt-8" lang="id" dangerouslySetInnerHTML={{ __html: data.html }} />
        ) : (
          <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {dict.article.empty}
          </p>
        )}
      </article>

      <ArticlePager lang={lang} {...data.neighbors} />
    </DocsPage>
  )
}

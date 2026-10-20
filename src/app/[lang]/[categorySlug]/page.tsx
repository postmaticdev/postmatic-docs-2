import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FileText, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ArticleCard } from "@/components/docs/article-card"
import { DocsPage, PageHeader } from "@/components/docs/docs-page"
import { JsonLd } from "@/components/docs/json-ld"
import { OPEN_GRAPH_LOCALE, formatMessage, isLocale, localizeHref } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getDocumentationIndex } from "@/lib/documentation-api"
import { safeDecode } from "@/lib/documentation-model"
import { SITE_URL } from "@/lib/site-config"

export const revalidate = 300

type Props = { params: Promise<{ lang: string; categorySlug: string }> }

async function getCategory(categorySlug: string) {
  const { categories } = await getDocumentationIndex()
  return categories.find((category) => category.slug === safeDecode(categorySlug)) ?? null
}

export async function generateStaticParams() {
  const { categories } = await getDocumentationIndex()
  return categories.map((category) => ({ categorySlug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, categorySlug } = await params
  const category = isLocale(lang) ? await getCategory(categorySlug) : null
  if (!isLocale(lang) || !category) return {}

  const dict = getDictionary(lang)
  const description = formatMessage(dict.category.metaDescription, {
    name: category.name,
    titles: category.articles.map((article) => article.title).join(", "),
  })

  return {
    title: category.name,
    description,
    alternates: {
      canonical: localizeHref(lang, category.href),
      languages: { id: category.href, en: localizeHref("en", category.href), "x-default": category.href },
    },
    openGraph: {
      type: "website",
      locale: OPEN_GRAPH_LOCALE[lang],
      url: localizeHref(lang, category.href),
      title: category.name,
      description,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { lang, categorySlug } = await params
  if (!isLocale(lang)) notFound()
  const category = await getCategory(categorySlug)
  if (!category) notFound()

  const dict = getDictionary(lang)
  const TypeIcon = category.type === "legality" ? ShieldCheck : FileText

  return (
    <DocsPage
      breadcrumbs={[{ label: dict.nav.home, href: "/" }, { label: category.name }]}
      toc={category.articles.map((article) => ({ id: `artikel-${article.slug}`, title: article.title, level: 2 }))}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${SITE_URL}${localizeHref(lang, "/")}` },
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `${SITE_URL}${localizeHref(lang, category.href)}`,
            },
          ],
        }}
      />

      <PageHeader
        eyebrow={
          <Badge variant="secondary" className="gap-1.5">
            <TypeIcon className="size-3.5" aria-hidden="true" />
            {dict.article.typeLabel[category.type]}
          </Badge>
        }
        title={category.name}
        description={formatMessage(dict.category.description, {
          count: category.articles.length,
          name: category.name,
        })}
      />

      <div className="mt-10 grid gap-3">
        {category.articles.map((article) => (
          <ArticleCard key={article.href} lang={lang} id={`artikel-${article.slug}`} article={article} />
        ))}
      </div>
    </DocsPage>
  )
}

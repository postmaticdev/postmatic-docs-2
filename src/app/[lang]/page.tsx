import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, BookOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ArticleCard } from "@/components/docs/article-card"
import { DocsPage, PageHeader } from "@/components/docs/docs-page"
import { JsonLd } from "@/components/docs/json-ld"
import { SearchTrigger } from "@/components/docs/search-trigger"
import { formatMessage, isLocale, localizeHref } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getDocumentationIndex } from "@/lib/documentation-api"
import { SITE_NAME, SITE_URL } from "@/lib/site-config"

export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = getDictionary(lang)
  const { categories, articles } = await getDocumentationIndex()
  const [firstArticle] = articles

  return (
    <DocsPage
      breadcrumbs={[{ label: dict.nav.home }]}
      toc={categories.map((category) => ({ id: `kategori-${category.slug}`, title: category.name, level: 2 }))}
    >
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            alternateName: dict.site.title,
            url: `${SITE_URL}${localizeHref(lang, "/")}`,
            inLanguage: lang === "id" ? "id-ID" : "en-US",
            description: dict.site.description,
            publisher: { "@type": "Organization", name: "Postmatic.id", url: "https://postmatic.id", logo: `${SITE_URL}/icon.png` },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: dict.site.title,
            itemListElement: articles.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: article.title,
              url: `${SITE_URL}${localizeHref(lang, article.href)}`,
            })),
          },
        ]}
      />

      <PageHeader
        eyebrow={
          <Badge variant="secondary" className="gap-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {dict.home.badge}
          </Badge>
        }
        title={dict.site.title}
        description={dict.home.description}
      >
        <SearchTrigger className="mt-8" />
        {firstArticle ? (
          <Link
            href={localizeHref(lang, firstArticle.href)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
          >
            {formatMessage(dict.home.startFrom, { title: firstArticle.title })}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </PageHeader>

      {categories.length === 0 ? (
        <p className="mt-12 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {dict.home.empty}
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {categories.map((category) => (
            <section key={category.slug} aria-labelledby={`kategori-${category.slug}`}>
              <div className="flex items-baseline justify-between gap-4 border-b pb-2">
                <h2 id={`kategori-${category.slug}`} className="scroll-mt-32 text-xl font-bold sm:text-2xl">
                  <Link href={localizeHref(lang, category.href)} className="hover:text-link">
                    {category.name}
                  </Link>
                </h2>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatMessage(dict.home.articleCount, { count: category.articles.length })}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {category.articles.map((article) => (
                  <ArticleCard key={article.href} lang={lang} article={article} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </DocsPage>
  )
}

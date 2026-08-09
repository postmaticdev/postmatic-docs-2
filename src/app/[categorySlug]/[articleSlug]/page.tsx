import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DocumentationPage } from "@/components/docs/documentation-page"
import { getDocumentationArticleBySlug, getDocumentationIndex } from "@/lib/documentation-api"
import {
  buildDocumentationArticles,
  findSelectedArticle,
} from "@/lib/documentation-model"

type ArticlePageProps = {
  params: Promise<{
    categorySlug: string
    articleSlug: string
  }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const { informationCategories, legalityCategories } = await getDocumentationIndex()

  return buildDocumentationArticles(informationCategories, legalityCategories).map((article) => ({
    categorySlug: article.categorySlug,
    articleSlug: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { categorySlug, articleSlug } = await params
  const { informationCategories, legalityCategories } = await getDocumentationIndex()
  const articles = buildDocumentationArticles(informationCategories, legalityCategories)
  const selectedArticle = findSelectedArticle(articles, categorySlug, articleSlug)

  if (!selectedArticle) {
    return { title: "Dokumentasi tidak ditemukan" }
  }

  const article = await getDocumentationArticleBySlug(categorySlug, articleSlug)
  const title = article.title?.trim() || selectedArticle.title
  const description = article.description?.trim() || selectedArticle.description

  return {
    title,
    description,
    alternates: { canonical: selectedArticle.href },
    openGraph: {
      type: "article",
      title,
      description,
      url: selectedArticle.href,
      siteName: "Postmatic.id Dokumentasi",
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { categorySlug, articleSlug } = await params
  const { informationCategories, legalityCategories } = await getDocumentationIndex()
  const articles = buildDocumentationArticles(informationCategories, legalityCategories)
  const selectedArticle = findSelectedArticle(articles, categorySlug, articleSlug)

  if (!selectedArticle) notFound()

  const article = await getDocumentationArticleBySlug(categorySlug, articleSlug)

  if (!article) notFound()

  return (
    <DocumentationPage
      informationCategories={informationCategories}
      legalityCategories={legalityCategories}
      selectedArticle={selectedArticle}
      article={article}
    />
  )
}

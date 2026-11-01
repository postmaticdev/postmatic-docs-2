import { DocumentationPage } from "@/components/docs/documentation-page"
import { getDocumentationArticleBySlug, getDocumentationIndex } from "@/lib/documentation-api"
import { buildDocumentationArticles } from "@/lib/documentation-model"

export default async function HomePage() {
  const { informationCategories, legalityCategories } = await getDocumentationIndex()
  const articles = buildDocumentationArticles(informationCategories, legalityCategories)
  const selectedArticle = articles[0] ?? null
  const article = selectedArticle
    ? await getDocumentationArticleBySlug(selectedArticle.categorySlug, selectedArticle.slug)
    : null

  return (
    <DocumentationPage
      informationCategories={informationCategories}
      legalityCategories={legalityCategories}
      selectedArticle={selectedArticle}
      article={article}
    />
  )
}

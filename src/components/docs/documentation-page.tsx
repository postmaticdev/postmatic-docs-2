import { DocsShell } from "@/components/docs/docs-shell"
import { Footer } from "@/components/docs/footer"
import { MainContent } from "@/components/docs/main-content"
import { prepareArticleHtml } from "@/lib/documentation-html"
import {
  buildDocumentationArticles,
  buildNavigationSections,
  findArticleNeighbors,
  type DocumentationArticleMeta,
} from "@/lib/documentation-model"
import type {
  RemoteDocumentation,
  RemoteDocumentationCategory,
} from "@/lib/documentation-types"

type DocumentationPageProps = {
  informationCategories: RemoteDocumentationCategory[]
  legalityCategories: RemoteDocumentationCategory[]
  selectedArticle: DocumentationArticleMeta | null
  article: RemoteDocumentation | null
}

export function DocumentationPage({
  informationCategories,
  legalityCategories,
  selectedArticle,
  article,
}: DocumentationPageProps) {
  const articles = buildDocumentationArticles(informationCategories, legalityCategories)
  const navigationSections = buildNavigationSections(
    informationCategories,
    legalityCategories,
  )
  const preparedArticle = prepareArticleHtml(article?.article)
  const { previousArticle, nextArticle } = findArticleNeighbors(articles, selectedArticle)

  return (
    <DocsShell
      sections={navigationSections}
      activeHref={selectedArticle?.href}
      headings={preparedArticle.headings}
    >
      <MainContent
        article={article}
        html={preparedArticle.html}
        selectedArticle={selectedArticle}
        previousArticle={previousArticle}
        nextArticle={nextArticle}
      />
      <Footer />
    </DocsShell>
  )
}

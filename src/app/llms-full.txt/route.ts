import { getAllProcessedArticles } from "@/lib/documentation-content"
import { formatDate } from "@/lib/documentation-model"
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site-config"

export const revalidate = 300

// Seluruh isi dokumentasi dalam Markdown agar mudah dikutip asisten AI.
export async function GET() {
  const articles = await getAllProcessedArticles()

  const body = [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    ...articles.flatMap(({ meta, article, markdown }) => {
      const updated = formatDate(article.updatedAt ?? article.createdAt)
      return [
        "---",
        "",
        `# ${meta.title}`,
        "",
        `URL: ${SITE_URL}${meta.href}`,
        `Kategori: ${meta.categoryName}`,
        ...(updated ? [`Terakhir diperbarui: ${updated}`] : []),
        ...(meta.description ? ["", `> ${meta.description}`] : []),
        "",
        markdown,
        "",
      ]
    }),
  ].join("\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  })
}

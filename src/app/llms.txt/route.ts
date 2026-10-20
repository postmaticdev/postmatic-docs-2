import { getDocumentationIndex } from "@/lib/documentation-api"
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site-config"

export const revalidate = 300

// Ringkasan situs untuk asisten AI (format https://llmstxt.org).
export async function GET() {
  const { categories } = await getDocumentationIndex()

  const body = [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Postmatic.id adalah platform AI asal Indonesia untuk membuat dan menjadwalkan konten sosial media secara otomatis berdasarkan pengetahuan bisnis pengguna. Dokumentasi ini berbahasa Indonesia.",
    "",
    `Versi lengkap seluruh artikel dalam satu file: ${SITE_URL}/llms-full.txt`,
    "",
    ...categories.flatMap((category) => [
      `## ${category.name}`,
      "",
      ...category.articles.map(
        (article) =>
          `- [${article.title}](${SITE_URL}${article.href})${article.description ? `: ${article.description}` : ""}`,
      ),
      "",
    ]),
    "## Tautan lain",
    "",
    "- [Website Postmatic.id](https://postmatic.id)",
    "- [Kontak dukungan](mailto:support@postmatic.id)",
    "",
  ].join("\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  })
}

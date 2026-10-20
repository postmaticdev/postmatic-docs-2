// Pencarian sisi client atas indeks /search-index.json (judul, deskripsi, sub-bagian, isi).

export type SearchIndexSection = { id: string; title: string; text: string }

export type SearchIndexArticle = {
  href: string
  title: string
  description: string
  categoryName: string
  type: string
  sections: SearchIndexSection[]
}

export type SearchSnippet = { before: string; match: string; after: string }

export type SearchResult = {
  key: string
  href: string
  title: string
  context: string
  snippet: SearchSnippet | null
  isSection: boolean
}

const MAX_RESULTS = 20
const MAX_SECTIONS_PER_ARTICLE = 3
const SNIPPET_RADIUS = 60

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

function tokenize(query: string) {
  return [...new Set(normalizeSearchText(query).split(/[^\p{L}\p{N}]+/u).filter(Boolean))]
}

function countHits(haystack: string, tokens: string[]) {
  return tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0)
}

function createSnippet(text: string, tokens: string[]): SearchSnippet | null {
  if (!text) return null

  // Pakai normalisasi yang sama dengan token (tanpa diakritik) selama panjang
  // teks tidak berubah, supaya indeks potongan tetap sejajar dengan teks asli.
  const folded = normalizeSearchText(text)
  const lower = folded.length === text.length ? folded : text.toLowerCase()
  let index = -1
  let length = 0
  for (const token of tokens) {
    const position = lower.indexOf(token)
    if (position !== -1 && (index === -1 || position < index)) {
      index = position
      length = token.length
    }
  }

  if (index === -1) {
    return { before: "", match: "", after: text.slice(0, SNIPPET_RADIUS * 2).trim() }
  }

  const start = Math.max(0, index - SNIPPET_RADIUS)
  const end = Math.min(text.length, index + length + SNIPPET_RADIUS)

  return {
    before: `${start > 0 ? "…" : ""}${text.slice(start, index).trimStart()}`,
    match: text.slice(index, index + length),
    after: `${text.slice(index + length, end).trimEnd()}${end < text.length ? "…" : ""}`,
  }
}

export function searchDocumentation(index: SearchIndexArticle[], query: string): SearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const phrase = normalizeSearchText(query.trim())
  const scored: (SearchResult & { score: number })[] = []

  for (const article of index) {
    const title = normalizeSearchText(article.title)
    const meta = normalizeSearchText(`${article.title} ${article.description} ${article.categoryName}`)
    const titleScore = (title.includes(phrase) ? 100 : 0) + countHits(title, tokens) * 20
    const metaScore = countHits(meta, tokens) * 4

    // Bagian pembuka (id "") mewakili artikel; selalu ada agar artikel yang
    // hanya cocok di judul/deskripsi tetap muncul sebagai satu hasil.
    const sections = article.sections.some((section) => !section.id)
      ? article.sections
      : [{ id: "", title: article.title, text: "" }, ...article.sections]
    const matches = sections
      .map((section) => {
        const heading = normalizeSearchText(section.title)
        const body = normalizeSearchText(section.text)
        const combined = `${meta} ${heading} ${body}`
        if (!tokens.every((token) => combined.includes(token))) return null
        // Sub-bagian hanya ditampilkan bila isinya sendiri cocok, bukan hanya
        // karena judul artikelnya cocok.
        if (section.id && countHits(`${heading} ${body}`, tokens) === 0) return null

        const sectionScore =
          (section.id && heading.includes(phrase) ? 60 : 0) +
          (section.id ? countHits(heading, tokens) * 12 : 0) +
          countHits(body, tokens) * 2 +
          (body.includes(phrase) ? 6 : 0)

        return { section, score: titleScore + metaScore + sectionScore }
      })
      .filter((match): match is NonNullable<typeof match> => match !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SECTIONS_PER_ARTICLE)

    for (const { section, score } of matches) {
      scored.push({
        key: `${article.href}#${section.id}`,
        href: section.id ? `${article.href}#${section.id}` : article.href,
        title: section.id ? section.title : article.title,
        context: section.id ? `${article.categoryName} › ${article.title}` : article.categoryName,
        snippet: createSnippet(section.text || article.description, tokens),
        isSection: Boolean(section.id),
        score,
      })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ key, href, title, context, snippet, isSection }) => ({
      key,
      href,
      title,
      context,
      snippet,
      isSection,
    }))
}

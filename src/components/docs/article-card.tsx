import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import { localizeHref, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import type { DocumentationArticleMeta } from "@/lib/documentation-model"
import { cn } from "@/lib/utils"

export function ArticleCard({
  lang,
  article,
  id,
  className,
}: {
  lang: Locale
  article: DocumentationArticleMeta
  id?: string
  className?: string
}) {
  return (
    <Link
      id={id}
      href={localizeHref(lang, article.href)}
      className={cn(
        "group flex scroll-mt-32 flex-col gap-1.5 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50",
        className,
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-semibold text-foreground group-hover:text-link">{article.title}</span>
        <ArrowRight
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-link"
          aria-hidden="true"
        />
      </span>
      {article.description ? (
        <span className="line-clamp-2 text-sm leading-6 text-muted-foreground" lang="id">
          {article.description}
        </span>
      ) : null}
    </Link>
  )
}

// Sebelumnya di kiri, Selanjutnya di kanan — juga di layar ponsel.
export function ArticlePager({
  lang,
  previousArticle,
  nextArticle,
}: {
  lang: Locale
  previousArticle: DocumentationArticleMeta | null
  nextArticle: DocumentationArticleMeta | null
}) {
  if (!previousArticle && !nextArticle) return null
  const dict = getDictionary(lang)

  return (
    <nav aria-label={dict.pager.label} className="mt-12 grid grid-cols-2 gap-3 border-t pt-8 sm:gap-4">
      {previousArticle ? (
        <Link
          href={localizeHref(lang, previousArticle.href)}
          rel="prev"
          className="group flex min-h-20 min-w-0 flex-col gap-1 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/50 sm:p-4"
        >
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <ChevronLeft className="size-3.5 shrink-0" aria-hidden="true" />
            {dict.pager.previous}
          </span>
          <span className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-link">
            {previousArticle.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
      {nextArticle ? (
        <Link
          href={localizeHref(lang, nextArticle.href)}
          rel="next"
          className="group flex min-h-20 min-w-0 flex-col items-end gap-1 rounded-lg border border-transparent bg-primary p-3 text-right text-primary-foreground shadow-xs transition-colors hover:bg-[#0052cc] sm:p-4"
        >
          <span className="flex items-center gap-1 text-xs font-medium text-primary-foreground">
            {dict.pager.next}
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
          </span>
          <span className="line-clamp-2 text-sm font-semibold">{nextArticle.title}</span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
    </nav>
  )
}

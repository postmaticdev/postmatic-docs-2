import { BookOpen, FileText, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DOCUMENTATION_TYPE_LABEL,
  formatDate,
  type DocumentationArticleMeta,
} from "@/lib/documentation-model"
import type { RemoteDocumentation } from "@/lib/documentation-types"

type MainContentProps = {
  article: RemoteDocumentation | null
  html: string
  selectedArticle: DocumentationArticleMeta | null
  previousArticle: DocumentationArticleMeta | null
  nextArticle: DocumentationArticleMeta | null
}

function EmptyState() {
  return (
    <article className="mx-auto flex min-h-[520px] w-full max-w-3xl items-center justify-center px-4 py-12 text-center sm:px-6">
      <div className="max-w-md">
        <BookOpen className="mx-auto size-10 text-muted-foreground/60" />
        <h1 className="mt-4 text-2xl font-bold">Documentation belum tersedia</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Artikel yang sudah dipublish dari dashboard admin akan muncul di halaman ini.
        </p>
      </div>
    </article>
  )
}

function NavigationCard({
  label,
  article,
  align = "left",
}: {
  label: string
  article: DocumentationArticleMeta | null
  align?: "left" | "right"
}) {
  if (!article) {
    return <div className="min-h-24 rounded-md border border-dashed bg-muted/20" />
  }

  return (
    <Link
      href={article.href}
      className={
        align === "right"
          ? "group flex min-h-24 flex-col gap-1 rounded-md border border-transparent bg-primary p-4 text-right shadow-xs transition-colors hover:bg-[#0052cc]"
          : "group flex min-h-24 flex-col gap-1 rounded-md border bg-card p-4 text-left transition-colors hover:bg-accent/50"
      }
    >
      <span
        className={
          align === "right"
            ? "text-xs font-medium text-blue-100"
            : "text-xs font-medium text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          align === "right"
            ? "line-clamp-2 text-sm font-semibold text-white"
            : "line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary"
        }
      >
        {article.title}
      </span>
    </Link>
  )
}

export function MainContent({
  article,
  html,
  selectedArticle,
  previousArticle,
  nextArticle,
}: MainContentProps) {
  if (!selectedArticle) return <EmptyState />

  const articleType =
    article?.type === "legality" || selectedArticle.type === "legality"
      ? "legality"
      : "information"
  const TypeIcon = articleType === "legality" ? ShieldCheck : FileText
  const title = article?.title?.trim() || selectedArticle.title
  const description = article?.description?.trim() || selectedArticle.description
  const updatedAt = formatDate(article?.updatedAt ?? article?.createdAt)
  const categoryName = article?.category?.name?.trim() || selectedArticle.categoryName

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Beranda</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={selectedArticle.href}>{categoryName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <TypeIcon className="size-3.5" />
          {DOCUMENTATION_TYPE_LABEL[articleType]}
        </Badge>
        <Badge variant="outline">{categoryName}</Badge>
      </div>

      <h1 className="text-balance text-4xl font-extrabold md:text-5xl">{title}</h1>

      {description ? (
        <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{description}</p>
      ) : null}

      {updatedAt ? (
        <div className="mt-8 flex items-center gap-3 border-y py-4 text-sm text-muted-foreground">
          <span>Terakhir diperbarui: {updatedAt}</span>
        </div>
      ) : null}

      {html ? (
        <div className="docs-content mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="mt-8 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Konten artikel belum tersedia.
        </div>
      )}

      <div className="mt-12 grid grid-cols-2 gap-3 border-t pt-8 sm:gap-4">
        <NavigationCard label="Sebelumnya" article={previousArticle} />
        <NavigationCard label="Selanjutnya" article={nextArticle} align="right" />
      </div>
    </article>
  )
}

import { AlertCircle, BookOpen, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { RemoteDocumentation } from "@/lib/documentation-api"
import {
  DOCUMENTATION_TYPE_ICON,
  DOCUMENTATION_TYPE_LABEL,
  type DocumentationArticleMeta,
  formatDate,
} from "@/lib/documentation-model"

type MainContentProps = {
  article: RemoteDocumentation | null
  html: string
  selectedArticle: DocumentationArticleMeta | null
  previousArticle: DocumentationArticleMeta | null
  nextArticle: DocumentationArticleMeta | null
  isLoading: boolean
  errorMessage?: string
  onRetry: () => void
  onNavigate: (href: string) => void
}

function ContentSkeleton() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 h-5 w-64 animate-pulse rounded bg-muted" />
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-28 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="h-11 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-6 w-full animate-pulse rounded bg-muted/70" />
      <div className="mt-2 h-6 w-2/3 animate-pulse rounded bg-muted/60" />
      <div className="mt-10 space-y-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className={
              index % 3 === 0
                ? "h-4 w-full animate-pulse rounded bg-muted/70"
                : index % 3 === 1
                  ? "h-4 w-11/12 animate-pulse rounded bg-muted/70"
                  : "h-4 w-3/4 animate-pulse rounded bg-muted/70"
            }
          />
        ))}
      </div>
    </article>
  )
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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <article className="mx-auto flex min-h-[520px] w-full max-w-3xl items-center justify-center px-4 py-12 text-center sm:px-6">
      <div className="max-w-md">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Dokumentasi tidak bisa dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        <Button type="button" onClick={onRetry} className="mt-5">
          <RefreshCw className="size-4" />
          Muat ulang
        </Button>
      </div>
    </article>
  )
}

function NavigationCard({
  label,
  article,
  align = "left",
  onNavigate,
}: {
  label: string
  article: DocumentationArticleMeta | null
  align?: "left" | "right"
  onNavigate: (href: string) => void
}) {
  if (!article) {
    return <div className="min-h-24 rounded-md border border-dashed bg-muted/20" />
  }

  return (
    <a
      href={article.href}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(article.href)
      }}
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
    </a>
  )
}

export function MainContent({
  article,
  html,
  selectedArticle,
  previousArticle,
  nextArticle,
  isLoading,
  errorMessage,
  onRetry,
  onNavigate,
}: MainContentProps) {
  if (isLoading) return <ContentSkeleton />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (!selectedArticle) return <EmptyState />

  const articleType =
    article?.type === "legality" || selectedArticle.type === "legality" ? "legality" : "information"
  const TypeIcon = DOCUMENTATION_TYPE_ICON[articleType]
  const title = article?.title?.trim() || selectedArticle.title
  const description = article?.description?.trim() || selectedArticle.description
  const updatedAt = formatDate(article?.updatedAt ?? article?.createdAt)
  const categoryName = article?.category?.name?.trim() || selectedArticle.categoryName

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              onClick={(event) => {
                event.preventDefault()
                onNavigate("/")
              }}
            >
              Beranda
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={selectedArticle.href}>{categoryName}</BreadcrumbLink>
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
        <NavigationCard
          label="Sebelumnya"
          article={previousArticle}
          onNavigate={onNavigate}
        />
        <NavigationCard
          label="Selanjutnya"
          article={nextArticle}
          align="right"
          onNavigate={onNavigate}
        />
      </div>
    </article>
  )
}

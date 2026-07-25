import * as React from "react"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { TopNavbar } from "@/components/docs/top-navbar"
import { LeftSidebar } from "@/components/docs/left-sidebar"
import { RightSidebar } from "@/components/docs/right-sidebar"
import { MainContent } from "@/components/docs/main-content"
import { Footer } from "@/components/docs/footer"
import {
  getDocumentationArticleBySlug,
  getDocumentationTableOfContents,
  type RemoteDocumentation,
  type RemoteDocumentationCategory,
} from "@/lib/documentation-api"
import {
  DOCUMENTATION_TYPE_LABEL,
  buildDocumentationArticles,
  buildNavigationSections,
  createArticleHref,
  findArticleNeighbors,
  findSelectedArticle,
  prepareArticleHtml,
  readRouteSelection,
  type DocumentationArticleMeta,
  type RouteSelection,
} from "@/lib/documentation-model"

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function createRouteFallback(selection: RouteSelection): DocumentationArticleMeta | null {
  if (!selection.categorySlug || !selection.articleSlug) return null

  return {
    id: `${selection.categorySlug}/${selection.articleSlug}`,
    slug: selection.articleSlug,
    title: selection.articleSlug,
    description: "",
    icon: "",
    type: "information",
    typeLabel: DOCUMENTATION_TYPE_LABEL.information,
    categoryName: selection.categorySlug,
    categorySlug: selection.categorySlug,
    href: createArticleHref(selection.categorySlug, selection.articleSlug),
  }
}

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [routeSelection, setRouteSelection] = React.useState<RouteSelection>(() =>
    readRouteSelection(),
  )
  const [informationCategories, setInformationCategories] = React.useState<
    RemoteDocumentationCategory[]
  >([])
  const [legalityCategories, setLegalityCategories] = React.useState<
    RemoteDocumentationCategory[]
  >([])
  const [tocLoading, setTocLoading] = React.useState(true)
  const [tocError, setTocError] = React.useState<string>()
  const [article, setArticle] = React.useState<RemoteDocumentation | null>(null)
  const [articleLoading, setArticleLoading] = React.useState(false)
  const [articleError, setArticleError] = React.useState<string>()
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const handlePopState = () => setRouteSelection(readRouteSelection())

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadTableOfContents() {
      setTocLoading(true)
      setTocError(undefined)

      const [informationResult, legalityResult] = await Promise.allSettled([
        getDocumentationTableOfContents("information", controller.signal),
        getDocumentationTableOfContents("legality", controller.signal),
      ])

      if (controller.signal.aborted) return

      const informationData =
        informationResult.status === "fulfilled" ? informationResult.value : []
      const legalityData = legalityResult.status === "fulfilled" ? legalityResult.value : []

      setInformationCategories(informationData)
      setLegalityCategories(legalityData)

      if (informationResult.status === "rejected" && legalityResult.status === "rejected") {
        setTocError(
          getErrorMessage(informationResult.reason, "Gagal memuat daftar dokumentasi."),
        )
      }

      setTocLoading(false)
    }

    void loadTableOfContents()

    return () => controller.abort()
  }, [reloadKey])

  const articles = React.useMemo(
    () => buildDocumentationArticles(informationCategories, legalityCategories),
    [informationCategories, legalityCategories],
  )

  const navigationSections = React.useMemo(
    () => buildNavigationSections(informationCategories, legalityCategories),
    [informationCategories, legalityCategories],
  )

  const selectedArticle = React.useMemo(
    () => findSelectedArticle(articles, routeSelection) ?? createRouteFallback(routeSelection),
    [articles, routeSelection],
  )

  React.useEffect(() => {
    if (!selectedArticle) {
      setArticle(null)
      setArticleError(undefined)
      setArticleLoading(false)
      return
    }

    const controller = new AbortController()
    setArticleLoading(true)
    setArticleError(undefined)

    getDocumentationArticleBySlug(
      selectedArticle.categorySlug,
      selectedArticle.slug,
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setArticle(data)
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setArticle(null)
          setArticleError(getErrorMessage(error, "Gagal memuat artikel dokumentasi."))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setArticleLoading(false)
        }
      })

    return () => controller.abort()
  }, [selectedArticle?.categorySlug, selectedArticle?.slug])

  const preparedArticle = React.useMemo(() => prepareArticleHtml(article), [article])

  const { previousArticle, nextArticle } = React.useMemo(
    () => findArticleNeighbors(articles, selectedArticle),
    [articles, selectedArticle],
  )

  const handleNavigate = React.useCallback((href: string) => {
    const nextPath = href || "/"

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, "", nextPath)
    }

    setRouteSelection(readRouteSelection(nextPath))
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [])

  const handleRetry = React.useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const pageIsLoading = tocLoading || articleLoading
  const pageError = tocError ?? articleError

  return (
    <div className="min-h-svh bg-background">
      <TopNavbar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r md:block">
          <LeftSidebar
            sections={navigationSections}
            activeHref={selectedArticle?.href}
            isLoading={tocLoading}
            onNavigate={handleNavigate}
          />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="top"
            className="flex max-h-[85svh] w-full flex-col p-0"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Navigasi Dokumentasi</SheetTitle>
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <img
                  src="/logo1.png"
                  alt="Postmatic Logo"
                  className="h-6 w-auto dark:hidden"
                />
                <img
                  src="/logo2.png"
                  alt="Postmatic Logo"
                  className="hidden h-6 w-auto dark:block"
                />
                <span className="text-lg font-bold text-[#0066FF] dark:text-white">
                  Postmatic
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <span>EN</span>
                </div>
                <ModeToggle />
                <SheetClose className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
                  <X className="size-5" />
                </SheetClose>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <LeftSidebar
                sections={navigationSections}
                activeHref={selectedArticle?.href}
                isLoading={tocLoading}
                onLinkClick={() => setMobileOpen(false)}
                onNavigate={handleNavigate}
              />
            </div>

            <div className="shrink-0 border-t bg-background p-4 pb-6">
              <Button
                className="w-full rounded-md border-none bg-[#0066FF] py-6 text-base font-bold text-white hover:bg-[#0052cc]"
                asChild
              >
                <a href="/dashboard">Mulai Sekarang</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex min-w-0 flex-1 flex-col">
          <MainContent
            article={article}
            html={preparedArticle.html}
            selectedArticle={selectedArticle}
            previousArticle={previousArticle}
            nextArticle={nextArticle}
            isLoading={pageIsLoading}
            errorMessage={pageError}
            onRetry={handleRetry}
            onNavigate={handleNavigate}
          />
          <Footer />
        </main>

        {preparedArticle.headings.length > 0 ? (
          <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-l py-8 pr-4 pl-4 xl:block">
            <RightSidebar items={preparedArticle.headings} />
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export default App

"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/docs/language-switcher"
import { OPEN_SEARCH_EVENT } from "@/components/docs/search-trigger"
import { localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import type { DocIcons } from "@/components/docs/left-sidebar"
import type { DocumentationNavSection } from "@/lib/documentation-model"
import { START_URL } from "@/lib/site-config"

// Dialog pencarian dan menu mobile baru diunduh saat pertama kali dibuka.
const loadSearchDialog = () => import("@/components/docs/search-dialog")
const loadMobileMenu = () => import("@/components/docs/mobile-menu")
const SearchDialog = dynamic(loadSearchDialog, { ssr: false })
const MobileMenu = dynamic(loadMobileMenu, { ssr: false })

type TopNavbarProps = {
  logo: React.ReactNode
  sections: DocumentationNavSection[]
  icons: DocIcons
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || Boolean(target.closest("input, textarea, select, [contenteditable='true']")))
  )
}

export function TopNavbar({ logo, sections, icons }: TopNavbarProps) {
  const { lang, dict } = useI18n()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobileMounted, setMobileMounted] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchMounted, setSearchMounted] = React.useState(false)
  const [shortcutLabel, setShortcutLabel] = React.useState("Ctrl K")

  const openSearch = React.useCallback(() => {
    setMobileOpen(false)
    setSearchMounted(true)
    setSearchOpen(true)
  }, [])

  const openMobileMenu = () => {
    setMobileMounted(true)
    setMobileOpen(true)
  }

  React.useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcutLabel("⌘K")

    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !isEditableTarget(event.target)
      if (!isShortcut && !isSlash) return

      event.preventDefault()
      openSearch()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener(OPEN_SEARCH_EVENT, openSearch)

    // Unduh kode dialog saat browser senggang (di luar jalur render) agar
    // ketikan pertama setelah Ctrl/⌘+K atau "/" tidak hilang.
    const preload = () => void loadSearchDialog()
    const idleId =
      "requestIdleCallback" in window ? window.requestIdleCallback(preload, { timeout: 5000 }) : null
    const timeoutId = idleId === null ? window.setTimeout(preload, 3000) : null

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener(OPEN_SEARCH_EVENT, openSearch)
      if (idleId !== null) window.cancelIdleCallback(idleId)
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [openSearch])

  const preloadSearch = () => void loadSearchDialog()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4 sm:px-6">
        <Link href={localizeHref(lang, "/")} className="flex shrink-0 items-center gap-2 rounded-md">
          {logo}
          <span className="text-base font-bold tracking-tight">Postmatic</span>
          <span className="hidden rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground sm:inline">
            Docs
          </span>
        </Link>

        <div className="flex flex-1 justify-center px-2">
          <button
            type="button"
            onClick={openSearch}
            onPointerEnter={preloadSearch}
            onFocus={preloadSearch}
            className="hidden h-9 w-full max-w-md items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground sm:flex dark:bg-input/30"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate text-left">{dict.nav.searchPlaceholder}</span>
            <kbd
              aria-hidden="true"
              className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] md:inline"
              suppressHydrationWarning
            >
              {shortcutLabel}
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={openSearch} aria-label={dict.nav.search}>
            <Search className="size-5" />
          </Button>
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <ModeToggle />
            <Button size="sm" asChild>
              <a href={START_URL}>
                {dict.nav.start}
                <ArrowRight />
              </a>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={openMobileMenu}
            onPointerEnter={() => void loadMobileMenu()}
            aria-label={dict.nav.openMenu}
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {mobileMounted ? (
        <MobileMenu
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          onSearch={openSearch}
          logo={logo}
          sections={sections}
          icons={icons}
        />
      ) : null}
      {searchMounted ? <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} sections={sections} /> : null}
    </header>
  )
}

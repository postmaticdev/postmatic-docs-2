"use client"

import type * as React from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/docs/language-switcher"
import { LeftSidebar } from "@/components/docs/left-sidebar"
import { localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import type { DocumentationNavSection } from "@/lib/documentation-model"
import { START_URL } from "@/lib/site-config"

type MobileMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: () => void
  logo: React.ReactNode
  sections: DocumentationNavSection[]
}

export default function MobileMenu({ open, onOpenChange, onSearch, logo, sections }: MobileMenuProps) {
  const { lang, dict } = useI18n()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="flex max-h-[90svh] w-full flex-col gap-0 p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">{dict.nav.docsNavigation}</SheetTitle>
        <SheetDescription className="sr-only">{dict.nav.docsNavigationDescription}</SheetDescription>
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <Link href={localizeHref(lang, "/")} className="flex items-center gap-2" onClick={() => onOpenChange(false)}>
            {logo}
            <span className="text-lg font-bold tracking-tight">Postmatic</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label={dict.nav.closeMenu}>
                <X className="size-5" />
              </Button>
            </SheetClose>
          </div>
        </div>

        <div className="flex gap-2 border-b p-4">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground dark:bg-input/30"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{dict.nav.searchPlaceholder}</span>
          </button>
          <LanguageSwitcher />
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <LeftSidebar sections={sections} onLinkClick={() => onOpenChange(false)} />
        </div>

        <div className="shrink-0 border-t p-4">
          <Button size="lg" className="w-full font-semibold" asChild>
            <a href={START_URL}>{dict.nav.start}</a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

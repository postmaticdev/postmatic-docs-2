"use client"

import * as React from "react"
import { X } from "lucide-react"

import { LeftSidebar } from "@/components/docs/left-sidebar"
import { RightSidebar } from "@/components/docs/right-sidebar"
import { TopNavbar } from "@/components/docs/top-navbar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import type { HeadingItem, DocumentationNavSection } from "@/lib/documentation-model"

type DocsShellProps = {
  sections: DocumentationNavSection[]
  activeHref?: string
  headings: HeadingItem[]
  children: React.ReactNode
}

export function DocsShell({ sections, activeHref, headings, children }: DocsShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="min-h-svh bg-background">
      <TopNavbar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r md:block">
          <LeftSidebar sections={sections} activeHref={activeHref} />
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
                {/* Regular img elements preserve the reference dimensions during migration. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo1.png" alt="Postmatic Logo" className="h-6 w-auto dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo2.png"
                  alt="Postmatic Logo"
                  className="hidden h-6 w-auto dark:block"
                />
                <span className="text-lg font-bold text-[#0066FF] dark:text-white">Postmatic</span>
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
                sections={sections}
                activeHref={activeHref}
                onLinkClick={() => setMobileOpen(false)}
              />
            </div>

            <div className="shrink-0 border-t bg-background p-4 pb-6">
              <Button
                className="w-full rounded-md border-none bg-[#0066FF] py-6 text-base font-bold text-white hover:bg-[#0052cc]"
                asChild
              >
                {/* Keep a full navigation because the dashboard is outside the docs router. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/dashboard">Mulai Sekarang</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex min-w-0 flex-1 flex-col">
          {children}
        </main>

        {headings.length > 0 ? (
          <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-l py-8 pr-4 pl-4 xl:block">
            <RightSidebar items={headings} />
          </aside>
        ) : null}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ContactBand } from "@/components/docs/contact-band"
import { MobileTableOfContents, TableOfContents } from "@/components/docs/table-of-contents"
import { localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import { CONTACT_SECTION_ID, OVERVIEW_ID, type HeadingItem } from "@/lib/documentation-model"
import { cn } from "@/lib/utils"

export type Crumb = { label: string; href?: string }

type DocsPageProps = {
  breadcrumbs: Crumb[]
  toc: HeadingItem[]
  children: React.ReactNode
}

// Komponen client agar juga bisa dipakai not-found.tsx (yang tidak menerima
// params): bahasa dibaca dari I18nProvider di layout.
export function DocsPage({ breadcrumbs, toc, children }: DocsPageProps) {
  const { lang, dict } = useI18n()
  const topLevel = toc.length > 0 ? Math.min(...toc.map((item) => item.level)) : 2
  const items: HeadingItem[] = [
    { id: OVERVIEW_ID, title: dict.toc.overview, level: topLevel },
    ...toc,
    { id: CONTACT_SECTION_ID, title: dict.contact.toc, level: topLevel },
  ]

  return (
    <>
      <main id="konten" className="min-w-0 flex-1">
        <div className="sticky top-14 z-30 border-b bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md">
          <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
            <Breadcrumb className="min-w-0 flex-1">
              <BreadcrumbList className="flex-nowrap gap-1.5 sm:gap-2">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  // Di layar kecil hanya Beranda dan halaman aktif yang ditampilkan.
                  const isMiddle = index > 0 && !isLast

                  return (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                      {index > 0 ? (
                        <BreadcrumbSeparator className={cn(isMiddle && "hidden sm:block")} />
                      ) : null}
                      <BreadcrumbItem className={cn(isLast ? "min-w-0" : "shrink-0", isMiddle && "hidden sm:inline-flex")}>
                        {isLast || !crumb.href ? (
                          <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={localizeHref(lang, crumb.href)}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <MobileTableOfContents items={items} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6 lg:pt-10">
          {children}
          <ContactBand />
        </div>
      </main>

      <aside className="scrollbar-none sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto overscroll-contain border-l px-5 py-8 xl:block">
        <TableOfContents items={items} />
      </aside>
    </>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <header id={OVERVIEW_ID} className="scroll-mt-32">
      {eyebrow ? <div className="mb-4 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
      <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">{description}</p>
      ) : null}
      {children}
    </header>
  )
}

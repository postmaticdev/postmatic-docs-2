"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, FileText, House, ShieldCheck } from "lucide-react"

import { localizeHref, splitLocale } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import { cn } from "@/lib/utils"
import { safeDecode, type DocumentationNavSection, type DocumentationType } from "@/lib/documentation-model"

const TYPE_ICON: Record<DocumentationType, typeof FileText> = {
  information: FileText,
  legality: ShieldCheck,
}

type LeftSidebarProps = {
  className?: string
  sections: DocumentationNavSection[]
  onLinkClick?: () => void
}

function isSectionActive(section: DocumentationNavSection, pathname: string) {
  return (
    safeDecode(section.href) === pathname ||
    section.items.some((item) => safeDecode(item.href) === pathname)
  )
}

export function LeftSidebar({ className, sections, onLinkClick }: LeftSidebarProps) {
  const { lang, dict } = useI18n()
  // Bandingkan tanpa prefiks bahasa (/en) karena href data selalu tanpa prefiks.
  const pathname = safeDecode(splitLocale(usePathname()).path)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})

  // Section yang berisi halaman aktif selalu dibuka saat navigasi; section lain
  // tetap seperti yang dipilih pengguna.
  React.useEffect(() => {
    const active = sections.find((section) => isSectionActive(section, pathname))
    if (active) setOpenSections((current) => (current[active.key] ? current : { ...current, [active.key]: true }))
  }, [pathname, sections])

  if (sections.length === 0) {
    return (
      <nav aria-label={dict.nav.docsNavigation} className={cn("p-4", className)}>
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{dict.nav.empty}</p>
      </nav>
    )
  }

  const linkClassName = (isActive: boolean) =>
    cn(
      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
      isActive
        ? "bg-accent font-semibold text-link"
        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
    )

  return (
    <nav aria-label={dict.nav.docsNavigation} className={cn("flex flex-col gap-1 p-4", className)}>
      <Link
        href={localizeHref(lang, "/")}
        onClick={onLinkClick}
        aria-current={pathname === "/" ? "page" : undefined}
        className={cn(linkClassName(pathname === "/"), "mb-3 font-medium")}
      >
        <House className="size-4 shrink-0" aria-hidden="true" />
        {dict.nav.home}
      </Link>

      {sections.map((section) => {
        const Icon = TYPE_ICON[section.type]
        const isOpen = openSections[section.key] ?? isSectionActive(section, pathname)

        return (
          <details
            key={section.key}
            open={isOpen}
            onToggle={(event) => {
              const nextOpen = event.currentTarget.open
              if (nextOpen !== isOpen) setOpenSections((current) => ({ ...current, [section.key]: nextOpen }))
            }}
            className="group/section"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-semibold text-foreground/80 transition-colors select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="truncate">{section.title}</span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open/section:rotate-90"
                aria-hidden="true"
              />
            </summary>
            <ul className="mt-0.5 mb-3 ml-2 flex flex-col gap-0.5 border-l pl-2">
              {section.items.map((item) => {
                const isActive = safeDecode(item.href) === pathname

                return (
                  <li key={item.href}>
                    <Link
                      href={localizeHref(lang, item.href)}
                      onClick={onLinkClick}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClassName(isActive)}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-link" : "text-muted-foreground/70 group-hover:text-foreground",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </nav>
  )
}

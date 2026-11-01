"use client"

import * as React from "react"
import { ChevronRight, FileText, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { DocumentationNavSection } from "@/lib/documentation-model"

type LeftSidebarProps = {
  className?: string
  sections: DocumentationNavSection[]
  activeHref?: string
  isLoading?: boolean
  onLinkClick?: () => void
}

export function LeftSidebar({
  className,
  sections,
  activeHref,
  isLoading = false,
  onLinkClick,
}: LeftSidebarProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})

  if (isLoading) {
    return (
      <nav className={cn("flex flex-col gap-5 p-4", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded-md bg-muted/70" />
            <div className="h-8 animate-pulse rounded-md bg-muted/50" />
          </div>
        ))}
      </nav>
    )
  }

  if (sections.length === 0) {
    return (
      <nav className={cn("p-4", className)}>
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Dokumentasi belum tersedia.
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn("flex flex-col gap-6 p-4", className)}>
      {sections.map((section) => {
        const containsActiveItem = section.items.some((item) => item.href === activeHref)
        const isOpen = openSections[section.title] ?? containsActiveItem

        const toggleSection = () =>
          setOpenSections((current) => ({ ...current, [section.title]: !isOpen }))

        return (
          <Collapsible
            key={section.title}
            open={isOpen}
            onOpenChange={toggleSection}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              <span className="truncate text-left">{section.title}</span>
              <ChevronRight
                className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-90")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 flex flex-col gap-0.5 border-l pl-3">
                {section.items.map((item) => {
                  const Icon = item.type === "legality" ? ShieldCheck : FileText
                  const isActive = item.href === activeHref

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-md py-1.5 pr-2 pl-2 text-sm transition-colors",
                          isActive
                            ? "font-semibold text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/70 group-hover:text-foreground",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </nav>
  )
}

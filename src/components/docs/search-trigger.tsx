"use client"

import { Search } from "lucide-react"

import { useI18n } from "@/i18n/provider"
import { cn } from "@/lib/utils"

export const OPEN_SEARCH_EVENT = "docs:open-search"

export function SearchTrigger({ className }: { className?: string }) {
  const { dict } = useI18n()

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-lg border bg-background px-4 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground dark:bg-input/30",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-left">{dict.search.heroPlaceholder}</span>
    </button>
  )
}

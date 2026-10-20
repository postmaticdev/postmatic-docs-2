"use client"

import * as React from "react"
import { ArrowUp, ListTree } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { HeadingItem } from "@/lib/documentation-model"
import { useI18n } from "@/i18n/provider"
import { cn } from "@/lib/utils"

// Jarak dari atas viewport (navbar + bar breadcrumb) untuk menentukan bagian aktif.
const ACTIVE_OFFSET = 140

function useActiveHeading(items: HeadingItem[]) {
  const ids = items.map((item) => item.id).join("|")
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? "")

  React.useEffect(() => {
    const headingIds = ids ? ids.split("|") : []
    if (headingIds.length === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      let current = headingIds[0]
      for (const id of headingIds) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top - ACTIVE_OFFSET > 0) break
        current = id
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      setActiveId(atBottom && window.scrollY > 0 ? headingIds[headingIds.length - 1] : current)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [ids])

  return activeId
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: HeadingItem[]
  activeId: string
  onNavigate?: () => void
}) {
  const minLevel = Math.min(...items.map((item) => item.level))

  return (
    <ul className="flex flex-col border-l">
      {items.map((item) => {
        const isActive = item.id === activeId

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              style={{ paddingLeft: `${0.75 + (item.level - minLevel) * 0.75}rem` }}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pr-2 text-sm leading-snug transition-colors",
                isActive
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function TableOfContents({ items }: { items: HeadingItem[] }) {
  const { dict } = useI18n()
  const activeId = useActiveHeading(items)

  return (
    <nav aria-label={dict.toc.title} className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-foreground">{dict.toc.title}</p>
      <TocList items={items} activeId={activeId} />
      <a
        href="#top"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowUp className="size-3.5" aria-hidden="true" />
        {dict.toc.backToTop}
      </a>
    </nav>
  )
}

// Panel daftar isi untuk layar < xl. Ditulis tanpa Radix agar ringan:
// cukup tombol disclosure + panel, ditutup lewat Escape, klik di luar, atau pilih tautan.
export function MobileTableOfContents({ items }: { items: HeadingItem[] }) {
  const { dict } = useI18n()
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const panelId = React.useId()
  const activeId = useActiveHeading(items)
  const activeTitle = items.find((item) => item.id === activeId)?.title

  React.useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative max-w-[45%] shrink-0 xl:hidden">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        className="w-full max-w-full gap-1.5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <ListTree aria-hidden="true" />
        <span className="truncate">{activeTitle ?? dict.toc.title}</span>
        <span className="sr-only">{dict.toc.openLabel}</span>
      </Button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-40 mt-2 scrollbar-none max-h-[60svh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
      >
        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {dict.toc.title}
        </p>
        <TocList items={items} activeId={activeId} onNavigate={() => setOpen(false)} />
      </div>
    </div>
  )
}

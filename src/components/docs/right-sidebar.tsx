"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TocItem = {
  id: string
  title: string
  level: number
}

type RightSidebarProps = {
  items: TocItem[]
  className?: string
}

export function RightSidebar({ items, className }: RightSidebarProps) {
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-sm font-semibold text-foreground">Pada halaman ini</p>
      <ul className="flex flex-col gap-1.5 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-0.5 text-sm transition-colors",
                item.level === 3 && "pl-6",
                item.level === 2 && "pl-3",
                activeId === item.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

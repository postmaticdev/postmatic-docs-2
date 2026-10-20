"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import { FileText, Hash, Loader2, SearchIcon, SearchX } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { formatMessage, localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import type { DocumentationNavSection } from "@/lib/documentation-model"
import { searchDocumentation, type SearchIndexArticle, type SearchResult } from "@/lib/search"

type SearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: DocumentationNavSection[]
}

// Indeks dimuat sekali per sesi, hanya saat dialog pertama kali dibuka.
let indexPromise: Promise<SearchIndexArticle[]> | null = null

function loadSearchIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<SearchIndexArticle[]>
    })
    .catch((error: unknown) => {
      indexPromise = null
      throw error
    })
  return indexPromise
}

const itemClassName =
  "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm outline-hidden select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"

function ResultItem({ result, onSelect }: { result: SearchResult; onSelect: (href: string) => void }) {
  const Icon = result.isSection ? Hash : FileText

  return (
    <CommandPrimitive.Item value={result.key} onSelect={() => onSelect(result.href)} className={itemClassName}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{result.title}</span>
        <span className="block truncate text-xs text-muted-foreground">{result.context}</span>
        {result.snippet ? (
          <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {result.snippet.before}
            {result.snippet.match ? (
              <mark className="rounded-sm bg-primary/15 px-0.5 text-foreground">{result.snippet.match}</mark>
            ) : null}
            {result.snippet.after}
          </span>
        ) : null}
      </span>
    </CommandPrimitive.Item>
  )
}

export default function SearchDialog({ open, onOpenChange, sections }: SearchDialogProps) {
  const router = useRouter()
  const { lang, dict } = useI18n()
  const [query, setQuery] = React.useState("")
  const [index, setIndex] = React.useState<SearchIndexArticle[] | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    if (!open || index) return

    let active = true
    setFailed(false)
    loadSearchIndex()
      .then((data) => {
        if (active) setIndex(data)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [open, index])

  const results = React.useMemo(
    () => (index ? searchDocumentation(index, query) : []),
    [index, query],
  )

  // Filter cmdk dimatikan, jadi item pertama harus dipilih ulang setiap kali
  // hasil berubah agar Enter langsung membuka hasil teratas.
  const firstValue = query.trim() ? results[0]?.key : sections[0]?.items[0]?.href
  const [selectedValue, setSelectedValue] = React.useState("")
  React.useEffect(() => {
    setSelectedValue(firstValue ?? "")
  }, [firstValue])

  const handleSelect = React.useCallback(
    (href: string) => {
      onOpenChange(false)
      setQuery("")
      router.push(localizeHref(lang, href))
    },
    [lang, onOpenChange, router],
  )

  const hasQuery = query.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-4 translate-y-0 gap-0 overflow-hidden p-0 sm:top-[12vh] sm:max-w-xl"
      >
        <DialogTitle className="sr-only">{dict.search.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {dict.search.description}
        </DialogDescription>

        <CommandPrimitive
          shouldFilter={false}
          loop
          label={dict.search.title}
          value={selectedValue}
          onValueChange={setSelectedValue}
          className="flex min-w-0 flex-col"
        >
          <div className="flex h-14 items-center gap-3 border-b px-4">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder={dict.nav.searchPlaceholder}
              maxLength={100}
              className="h-full w-full bg-transparent text-base outline-hidden placeholder:text-muted-foreground sm:text-sm"
            />
            <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          <CommandPrimitive.List className="max-h-[min(60svh,28rem)] overflow-y-auto overscroll-contain p-2">
            {hasQuery && !index && !failed ? (
              <CommandPrimitive.Loading className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {dict.search.loading}
              </CommandPrimitive.Loading>
            ) : null}

            {hasQuery && failed ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {dict.search.failed}
              </p>
            ) : null}

            {hasQuery && index ? (
              <CommandPrimitive.Empty className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <SearchX className="size-5" aria-hidden="true" />
                {formatMessage(dict.search.noResults, { query: query.trim() })}
              </CommandPrimitive.Empty>
            ) : null}

            {hasQuery
              ? results.map((result) => (
                  <ResultItem key={result.key} result={result} onSelect={handleSelect} />
                ))
              : sections.map((section) => (
                  <CommandPrimitive.Group
                    key={section.key}
                    heading={section.title}
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {section.items.map((item) => (
                      <CommandPrimitive.Item
                        key={item.href}
                        value={item.href}
                        onSelect={() => handleSelect(item.href)}
                        className={itemClassName}
                      >
                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate">{item.title}</span>
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                ))}
          </CommandPrimitive.List>

          <div className="hidden items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex">
            <span>
              <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> {dict.search.select}
            </span>
            <span>
              <kbd className="font-mono">Enter</kbd> {dict.search.open}
            </span>
            <span>
              <kbd className="font-mono">Esc</kbd> {dict.search.close}
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}

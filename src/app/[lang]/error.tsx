"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { lang, dict } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="konten" className="flex min-w-0 flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold">{dict.error.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.error.description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => retry()}>
            <RefreshCw aria-hidden="true" />
            {dict.error.retry}
          </Button>
          <Button asChild variant="outline">
            <Link href={localizeHref(lang, "/")}>{dict.error.home}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

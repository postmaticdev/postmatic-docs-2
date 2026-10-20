"use client"

import Link from "next/link"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DocsPage, PageHeader } from "@/components/docs/docs-page"
import { SearchTrigger } from "@/components/docs/search-trigger"
import { localizeHref } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"

export default function NotFound() {
  const { lang, dict } = useI18n()

  return (
    <DocsPage breadcrumbs={[{ label: dict.nav.home, href: "/" }, { label: dict.notFound.breadcrumb }]} toc={[]}>
      <PageHeader
        eyebrow={<SearchX className="size-8 text-muted-foreground" aria-hidden="true" />}
        title={dict.notFound.title}
        description={dict.notFound.description}
      >
        <SearchTrigger className="mt-8" />
        <Button asChild variant="outline" className="mt-4">
          <Link href={localizeHref(lang, "/")}>{dict.notFound.backHome}</Link>
        </Button>
      </PageHeader>
    </DocsPage>
  )
}

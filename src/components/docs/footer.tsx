import Link from "next/link"

import { PostmaticLogo } from "@/components/docs/logo"
import { localizeHref, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"
import { LANDING_URL, SUPPORT_EMAIL, privacyUrl, termsUrl } from "@/lib/site-config"

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { label: dict.footer.website, href: lang === "id" ? LANDING_URL : `${LANDING_URL}/${lang}` },
    { label: dict.footer.help, href: `mailto:${SUPPORT_EMAIL}` },
    { label: dict.footer.privacy, href: privacyUrl(lang) },
    { label: dict.footer.terms, href: termsUrl(lang) },
  ]

  return (
    <footer className="flex border-t bg-background">
      {/* Mobile: semua rata tengah; desktop: identitas di kiri, tautan rata kanan. */}
      <div className="min-w-0 flex-1">
        <div className="flex w-full flex-col items-center gap-4 px-4 py-6 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-2">
            <Link href={localizeHref(lang, "/")} className="flex w-fit items-center gap-2">
              <PostmaticLogo className="h-4" />
              <span className="text-xs font-semibold tracking-wide text-foreground uppercase">Postmatic.id</span>
            </Link>
            <span className="hidden text-muted-foreground/60 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-xs">
              © {new Date().getFullYear()} {dict.footer.tagline}
            </span>
          </div>

          <nav aria-label={dict.footer.linksLabel} className="lg:ml-auto">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground lg:justify-end">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

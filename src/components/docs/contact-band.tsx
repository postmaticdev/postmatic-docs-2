"use client"

import { usePathname } from "next/navigation"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SupportIllustration } from "@/components/docs/support-illustration"
import { localizeHref, splitLocale } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"
import { CONTACT_SECTION_ID } from "@/lib/documentation-model"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"

// Blok "Butuh bantuan lebih lanjut?" di akhir kolom konten. Tombol membuka
// aplikasi email pengguna dengan penerima, subjek, dan URL halaman yang sudah terisi.
export function ContactBand() {
  const { lang, dict } = useI18n()
  const t = dict.contact
  const pathname = usePathname()

  const pageUrl = `${SITE_URL}${localizeHref(lang, splitLocale(pathname).path)}`
  const body = `${t.bodyGreeting}\n\n\n\n---\n${t.bodyPage}: ${pageUrl}`
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(body)}`

  return (
    <section
      id={CONTACT_SECTION_ID}
      aria-labelledby={`${CONTACT_SECTION_ID}-judul`}
      className="mt-16 flex scroll-mt-32 items-center justify-between gap-4 rounded-2xl border bg-muted/60 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8 dark:bg-card"
    >
      <div className="flex min-w-0 flex-col items-start">
        <h2 id={`${CONTACT_SECTION_ID}-judul`} className="text-xl font-bold tracking-tight text-balance sm:text-2xl">
          {t.title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-pretty text-muted-foreground sm:text-base">{t.description}</p>
        <Button
          asChild
          size="lg"
          className="mt-5 bg-foreground px-6 font-semibold text-background hover:bg-foreground/85 sm:min-w-40"
        >
          <a href={mailto}>
            <Mail />
            {t.button}
          </a>
        </Button>
      </div>
      <SupportIllustration className="w-24 shrink-0 sm:w-36" />
    </section>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LOCALE_COOKIE, localizeHref, splitLocale, type Locale } from "@/i18n/config"
import { useI18n } from "@/i18n/provider"

// Pilihan eksplisit disimpan di cookie agar deteksi bahasa otomatis di proxy
// tidak menimpanya pada kunjungan berikutnya.
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { lang, dict } = useI18n()
  const pathname = usePathname()
  const target: Locale = lang === "id" ? "en" : "id"
  const href = localizeHref(target, splitLocale(pathname).path)

  // Tautan biasa (bukan <Link>): ganti bahasa berarti ganti root layout (atribut lang).
  return (
    <Button variant={variant === "full" ? "outline" : "ghost"} size="sm" className="gap-1.5" asChild>
      <a
        href={href}
        hrefLang={target}
        lang={target}
        title={dict.nav.switchLanguage}
        onClick={() => rememberLocale(target)}
      >
        <Languages aria-hidden="true" />
        {variant === "full" ? dict.language.switchTo : target.toUpperCase()}
      </a>
    </Button>
  )
}

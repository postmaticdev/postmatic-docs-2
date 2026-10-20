import { NextResponse, type NextRequest } from "next/server"

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config"

// Crawler dan alat audit tidak dialihkan berdasarkan bahasa browser: mereka
// harus melihat URL apa adanya (versi bahasa lain ditautkan lewat hreflang).
const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless|bingpreview/i

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(cookie)) return cookie

  if (BOT_PATTERN.test(request.headers.get("user-agent") ?? "")) return DEFAULT_LOCALE

  // Ambil bahasa pertama (berdasarkan bobot q) yang didukung dari Accept-Language.
  const languages = (request.headers.get("accept-language") ?? "")
    .split(",")
    .slice(0, 10)
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";")
      const q = Number(params.find((param) => param.trim().startsWith("q="))?.trim().slice(2) ?? 1)
      return { base: tag.split("-")[0], q: Number.isFinite(q) ? q : 0 }
    })
    .filter((language) => language.q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { base } of languages) {
    if (base === "id" || base === "in" || base === "ms") return "id"
    if (base === "en") return "en"
  }
  return DEFAULT_LOCALE
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const [, firstSegment] = pathname.split("/")

  // /en/... sudah berbahasa jelas.
  if (isLocale(firstSegment) && firstSegment !== DEFAULT_LOCALE) return NextResponse.next()

  // /id/... → URL tanpa prefiks agar tidak ada dua URL untuk konten yang sama.
  if (firstSegment === DEFAULT_LOCALE) {
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/"
    return NextResponse.redirect(url, 308)
  }

  const isNavigation = request.method === "GET" || request.method === "HEAD"
  const locale = isNavigation ? preferredLocale(request) : DEFAULT_LOCALE
  if (locale !== DEFAULT_LOCALE) {
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
    const response = NextResponse.redirect(url, 307)
    response.headers.set("Vary", "Accept-Language, Cookie")
    return response
  }

  url.pathname = `/${DEFAULT_LOCALE}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Lewati aset internal, gambar artikel, dan file ber-ekstensi (sitemap.xml,
  // robots.txt, llms.txt, search-index.json, ikon, og.png).
  matcher: ["/((?!_next/|media/|.*\\.[a-zA-Z0-9]+$).*)"],
}

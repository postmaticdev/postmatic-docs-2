// Bahasa Indonesia adalah default dan tidak memakai prefiks URL (URL lama tetap
// berlaku); English berada di bawah /en.
export const LOCALES = ["id", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "id"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export const LOCALE_LABEL: Record<Locale, string> = { id: "Indonesia", en: "English" }
export const OPEN_GRAPH_LOCALE: Record<Locale, string> = { id: "id_ID", en: "en_US" }
export const DATE_LOCALE: Record<Locale, string> = { id: "id-ID", en: "en-US" }

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

// "/getting-started" → "/en/getting-started" untuk English; tautan eksternal,
// anchor, dan mailto dibiarkan apa adanya.
export function localizeHref(lang: Locale, href: string) {
  if (lang === DEFAULT_LOCALE || !href.startsWith("/") || href.startsWith("//")) return href
  return href === "/" ? `/${lang}` : `/${lang}${href}`
}

// Kebalikan localizeHref: pisahkan prefiks bahasa dari pathname. Prefiks /id juga
// dibuang: saat prerender, usePathname di server berisi path hasil rewrite proxy
// (/id/...), sedangkan di browser tanpa prefiks; keduanya harus sama.
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/")
  if (isLocale(first)) {
    return { lang: first, path: `/${rest.join("/")}` }
  }
  return { lang: DEFAULT_LOCALE, path: pathname || "/" }
}

export function formatMessage(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { HapticsListener } from "@/components/haptics-listener"
import { renderDocIcons } from "@/components/docs/doc-icons"
import { LeftSidebar } from "@/components/docs/left-sidebar"
import { MediaLightbox } from "@/components/docs/media-lightbox"
import { PostmaticLogo } from "@/components/docs/logo"
import { TopNavbar } from "@/components/docs/top-navbar"
import { LOCALES, OPEN_GRAPH_LOCALE, isLocale, localizeHref } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { I18nProvider } from "@/i18n/provider"
import { getDocumentationIndex } from "@/lib/documentation-api"
import { ALLOW_INDEXING } from "@/lib/server-config"
import { SITE_NAME, SITE_URL } from "@/lib/site-config"
import { themeInitScript } from "@/lib/theme-script"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  preload: false,
})

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export const revalidate = 300

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.site.title, template: `%s | ${SITE_NAME}` },
    description: dict.site.description,
    applicationName: SITE_NAME,
    authors: [{ name: "Postmatic.id", url: "https://postmatic.id" }],
    publisher: "Postmatic.id",
    keywords: dict.site.keywords,
    alternates: {
      canonical: localizeHref(lang, "/"),
      languages: { id: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALE[lang],
      alternateLocale: LOCALES.filter((locale) => locale !== lang).map((locale) => OPEN_GRAPH_LOCALE[locale]),
      url: localizeHref(lang, "/"),
      title: dict.site.title,
      description: dict.site.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: dict.site.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.site.title,
      description: dict.site.description,
      images: ["/og.png"],
    },
    robots: ALLOW_INDEXING
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: false },
    formatDetection: { telephone: false, email: false, address: false },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = getDictionary(lang)
  const { sections } = await getDocumentationIndex()
  const icons = renderDocIcons(sections)

  return (
    <html lang={lang} className={`${inter.variable} ${jetBrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider lang={lang} dict={dict}>
            <div id="top" />
            <a
              href="#konten"
              className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:translate-y-0"
            >
              {dict.nav.skipToContent}
            </a>
            <TopNavbar logo={<PostmaticLogo className="h-5" />} sections={sections} icons={icons} />
            <MediaLightbox />
            <div className="mx-auto flex w-full max-w-screen-2xl">
              <aside className="scrollbar-none sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto overscroll-contain border-r md:block lg:w-72">
                <LeftSidebar sections={sections} icons={icons} />
              </aside>
              {/* Footer dirender tiap halaman di dalam kolom konten agar TOC kanan tetap setinggi layar. */}
              <div className="flex min-h-[calc(100svh-3.5rem)] min-w-0 flex-1">{children}</div>
            </div>
          </I18nProvider>
          <HapticsListener />
        </ThemeProvider>
      </body>
    </html>
  )
}

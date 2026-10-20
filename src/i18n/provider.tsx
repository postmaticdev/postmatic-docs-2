"use client"

import * as React from "react"

import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries"

const I18nContext = React.createContext<{ lang: Locale; dict: Dictionary } | null>(null)

export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: Locale
  dict: Dictionary
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ lang, dict }), [lang, dict])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}

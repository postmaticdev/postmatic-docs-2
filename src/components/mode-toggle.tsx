"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/provider"

export function ThemeButton(props: React.ComponentProps<typeof Button>) {
  const { dict } = useI18n()

  return (
    <Button variant="outline" size="icon" {...props}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{dict.theme.toggle}</span>
    </Button>
  )
}

const loadThemeMenu = () => import("@/components/theme-menu")

// Menu dropdown (Radix) baru diunduh saat tombol pertama kali disentuh,
// supaya tidak menambah JavaScript di pemuatan awal halaman.
const ThemeMenu = dynamic(loadThemeMenu, { ssr: false, loading: () => <ThemeButton aria-busy="true" /> })

export function ModeToggle() {
  const [active, setActive] = React.useState(false)

  if (active) return <ThemeMenu />

  return (
    <ThemeButton
      aria-haspopup="menu"
      onPointerEnter={() => void loadThemeMenu()}
      onFocus={() => void loadThemeMenu()}
      onClick={() => setActive(true)}
    />
  )
}

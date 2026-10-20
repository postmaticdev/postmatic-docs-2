"use client"

import { Check } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeButton } from "@/components/mode-toggle"
import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/i18n/provider"

const OPTIONS = ["light", "dark", "system"] as const

export default function ThemeMenu() {
  const { theme, setTheme } = useTheme()
  const { dict } = useI18n()

  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <ThemeButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem key={option} onClick={() => setTheme(option)}>
            {dict.theme[option]}
            {theme === option ? <Check className="ml-auto" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

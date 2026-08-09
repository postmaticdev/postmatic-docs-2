"use client"

import { Menu, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"

type TopNavbarProps = {
  onMenuClick: () => void
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="relative flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* Regular img elements preserve the reference dimensions during migration. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.png"
              alt="Postmatic Logo"
              className="h-6 w-auto dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo2.png"
              alt="Postmatic Logo"
              className="h-6 w-auto hidden dark:block"
            />
            <span className="text-lg font-bold tracking-tight">
              Postmatic
            </span>
          </Link>
        </div>

        {/* Middle Section: Centered Search */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden w-full max-w-xs sm:block md:max-w-md z-10">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari dokumentasi..."
              className="pl-9 w-full bg-background"
            />
            <kbd className="absolute top-1/2 right-3 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:flex">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions & Mobile Menu */}
        <div className="flex items-center gap-2 z-20">
          <div className="hidden md:flex items-center gap-2">
            <ModeToggle />
            <Button
              className="bg-primary hover:bg-primary/90 text-white dark:text-black border-none font-medium transition-colors animate-none"
              size="sm"
              asChild
            >
              {/* Keep a full navigation because the dashboard is outside the docs router. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/dashboard">Mulai Sekarang</a>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

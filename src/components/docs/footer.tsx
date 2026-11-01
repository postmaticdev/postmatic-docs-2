import * as React from "react"

import { cn } from "@/lib/utils"

type FooterProps = React.HTMLAttributes<HTMLElement>

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn("relative md:sticky bottom-0 z-30 border-t border-border/40 bg-background/80 backdrop-blur-md", className)}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6 md:py-5">
        <div className="flex flex-col items-center gap-1.5 text-center text-sm text-muted-foreground sm:flex-row sm:gap-2 sm:text-left">
          <div className="flex items-center gap-2">
            {/* Regular img elements preserve the reference dimensions during migration. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.png"
              alt="Postmatic Logo"
              className="h-4 w-auto dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo2.png"
              alt="Postmatic Logo"
              className="h-4 w-auto hidden dark:block"
            />
            <span className="font-semibold text-foreground text-xs tracking-wide uppercase">Postmatic.id</span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/60">·</span>
          <span className="text-xs">
            © {new Date().getFullYear()} - Made with love for your business.
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
          <a
            href="#status"
            className="transition-colors hover:text-foreground"
          >
            Status
          </a>
          <a
            href="#privasi"
            className="transition-colors hover:text-foreground"
          >
            Privasi
          </a>
          <a
            href="#ketentuan"
            className="transition-colors hover:text-foreground"
          >
            Ketentuan
          </a>
        </nav>
      </div>
    </footer>
  )
}

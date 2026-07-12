import * as React from "react"

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { TopNavbar } from "@/components/docs/top-navbar"
import { LeftSidebar } from "@/components/docs/left-sidebar"
import { RightSidebar } from "@/components/docs/right-sidebar"
import { MainContent } from "@/components/docs/main-content"
import { Footer } from "@/components/docs/footer"

const tocItems = [
  { id: "mulai-cepat", title: "Mulai Cepat", level: 2 },
  { id: "apa-itu-postmatic", title: "Apa itu Postmatic.id?", level: 2 },
  { id: "prasyarat", title: "Prasyarat", level: 2 },
  { id: "instalasi", title: "Instalasi", level: 2 },
  { id: "inisialisasi-client", title: "Inisialisasi Client", level: 3 },
  { id: "konfigurasi", title: "Opsi Konfigurasi", level: 3 },
  { id: "mengirim-email", title: "Mengirim Email Pertama", level: 2 },
  { id: "webhooks", title: "Webhooks", level: 2 },
  { id: "langkah-selanjutnya", title: "Langkah Selanjutnya", level: 2 },
]

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="min-h-svh bg-background">
      <TopNavbar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex">
        {/* Desktop left sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-72 shrink-0 border-r overflow-y-auto md:block">
          <LeftSidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="top" className="w-full p-0 flex flex-col max-h-[85svh]" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigasi Dokumentasi</SheetTitle>
            <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img
                  src="/logo1.png"
                  alt="Postmatic Logo"
                  className="h-6 w-auto dark:hidden"
                />
                <img
                  src="/logo2.png"
                  alt="Postmatic Logo"
                  className="h-6 w-auto hidden dark:block"
                />
                <span className="text-lg font-bold tracking-tight text-[#0066FF] dark:text-white">
                  Postmatic
                </span>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <span className="text-base select-none">🇺🇸</span>
                  <span>EN</span>
                </div>
                <ModeToggle />
                <SheetClose className="flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer shrink-0">
                  <X className="size-5" />
                </SheetClose>
              </div>
            </div>

            {/* Links Stack */}
            <div className="flex-1 overflow-y-auto">
              <LeftSidebar onLinkClick={() => setMobileOpen(false)} />
            </div>

            {/* Get Started Button */}
            <div className="p-4 border-t bg-background shrink-0 pb-6">
              <Button
                className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold py-6 text-base rounded-xl cursor-pointer border-none"
                asChild
              >
                <a href="/dashboard">Mulai Sekarang</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col">
          <MainContent />
          <Footer />
        </main>

        {/* Desktop right sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 border-l overflow-y-auto py-8 pr-4 pl-4 xl:block">
          <RightSidebar items={tocItems} />
        </aside>
      </div>
    </div>
  )
}

export default App

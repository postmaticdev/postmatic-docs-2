import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <BookOpen className="mx-auto size-10 text-muted-foreground/60" />
        <h1 className="mt-4 text-3xl font-bold">Dokumentasi tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Artikel mungkin belum dipublikasikan, telah dipindahkan, atau menunggu deployment terbaru.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">Kembali ke dokumentasi</Link>
        </Button>
      </div>
    </main>
  )
}

"use client"

import { useEffect } from "react"

import "./globals.css"

// Dipakai bila root layout sendiri gagal (mis. API daftar isi tidak bisa
// dihubungi saat halaman belum pernah di-cache).
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="id">
      <body className="flex min-h-svh items-center justify-center px-4">
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Dokumentasi sedang tidak bisa dimuat</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Terjadi gangguan saat menghubungi server. Silakan coba lagi beberapa saat lagi.
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground" lang="en">
            The documentation could not be loaded. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Muat ulang / Reload
          </button>
        </main>
      </body>
    </html>
  )
}

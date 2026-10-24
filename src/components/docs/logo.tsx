// 96px tinggi = cukup tajam untuk tampilan terbesar (h-6) di layar 4×. Dipakai
// lewat <img> biasa: next/image tidak menambah apa-apa untuk file sekecil ini,
// tapi ikut mengirim ±9 KB JavaScript ke browser.
import logo from "@/assets/postmatic-logo.webp"
import { cn } from "@/lib/utils"

// Satu file logo untuk kedua tema: versi biru di mode terang, diputihkan lewat
// filter CSS di mode gelap (tidak perlu mengunduh dua gambar).
export function PostmaticLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- lihat komentar di atas
    <img
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={cn("h-6 w-auto dark:brightness-0 dark:invert", className)}
    />
  )
}

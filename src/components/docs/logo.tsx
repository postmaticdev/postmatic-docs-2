import Image from "next/image"

import logo from "@/assets/postmatic-logo.png"
import { cn } from "@/lib/utils"

// Satu file logo untuk kedua tema: versi biru di mode terang, diputihkan lewat
// filter CSS di mode gelap (tidak perlu mengunduh dua gambar).
export function PostmaticLogo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt=""
      aria-hidden="true"
      loading="eager"
      sizes="32px"
      className={cn("h-6 w-auto dark:brightness-0 dark:invert", className)}
    />
  )
}

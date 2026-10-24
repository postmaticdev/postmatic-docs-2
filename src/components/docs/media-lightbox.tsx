"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { useI18n } from "@/i18n/provider"

type Media = { kind: "image"; src: string; alt: string } | { kind: "video"; src: string; poster?: string }

// Gambar dan video di konten artikel berasal dari HTML admin, jadi klik ditangkap
// lewat delegasi event, bukan dengan membungkus tiap elemen.
const MEDIA_SELECTOR = ".docs-content img, .docs-content video"

export function MediaLightbox() {
  const { dict } = useI18n()
  const [media, setMedia] = React.useState<Media | null>(null)

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.(MEDIA_SELECTOR)
      if (!target || target.closest("a")) return

      if (target instanceof HTMLImageElement) {
        const src = target.currentSrc || target.src
        if (!src) return
        event.preventDefault()
        setMedia({ kind: "image", src, alt: target.alt })
      } else if (target instanceof HTMLVideoElement) {
        const src = target.currentSrc || target.src || target.querySelector("source")?.src
        if (!src) return
        event.preventDefault()
        target.pause()
        setMedia({ kind: "video", src, poster: target.poster || undefined })
      }
    }

    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  React.useEffect(() => {
    if (!media) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMedia(null)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [media])

  if (!media) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) setMedia(null)
      }}
    >
      <button
        type="button"
        autoFocus
        onClick={() => setMedia(null)}
        aria-label={dict.search.close}
        className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <X className="size-5" />
      </button>
      {media.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- sumber gambar dinamis dari konten artikel
        <img src={media.src} alt={media.alt} className="max-h-full max-w-full rounded-md object-contain shadow-2xl" />
      ) : (
        <video
          src={media.src}
          poster={media.poster}
          controls
          autoPlay
          playsInline
          className="max-h-full max-w-full rounded-md shadow-2xl"
        />
      )}
    </div>,
    document.body,
  )
}

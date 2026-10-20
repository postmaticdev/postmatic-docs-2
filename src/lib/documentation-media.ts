import "server-only"

import { createHash } from "node:crypto"
import sharp from "sharp"

export const MEDIA_MAX_WIDTH = 1600

const DATA_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif|avif);base64,([a-z0-9+/=\s]+)$/i

export function decodeDataImage(src: string) {
  const match = DATA_IMAGE_PATTERN.exec(src.trim())
  if (!match) return null

  const data = Buffer.from(match[2].replace(/\s+/g, ""), "base64")
  if (data.length === 0) return null

  return {
    data,
    hash: createHash("sha256").update(data).digest("hex").slice(0, 24),
  }
}

export const MEDIA_FILE_PATTERN = /^([a-f0-9]{24})\.webp$/

// Lokasi artikel ikut di URL supaya route media cukup memeriksa satu artikel.
export function createMediaHref(categorySlug: string, articleSlug: string, hash: string) {
  return `/media/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}/${hash}.webp`
}

export async function readImageSize(data: Buffer) {
  const metadata = await sharp(data, { animated: true }).metadata()
  const width = metadata.autoOrient?.width ?? metadata.width
  // GIF animasi: tinggi total = tinggi satu frame × jumlah frame.
  const height = metadata.pageHeight ?? metadata.autoOrient?.height ?? metadata.height
  if (!width || !height) return null

  const scale = width > MEDIA_MAX_WIDTH ? MEDIA_MAX_WIDTH / width : 1
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export function convertToWebp(data: Buffer) {
  // animated: GIF tetap beranimasi sebagai WebP, bukan hanya frame pertama.
  return sharp(data, { animated: true })
    .rotate()
    .resize({ width: MEDIA_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer()
}

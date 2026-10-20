import { findArticleMedia, listMediaParams } from "@/lib/documentation-content"
import { MEDIA_FILE_PATTERN } from "@/lib/documentation-media"
import { safeDecode } from "@/lib/documentation-model"

// Gambar base64 dari editor disajikan sebagai file WebP terpisah. Nama file
// adalah hash isi gambar, jadi aman di-cache selamanya.
export const revalidate = false

type Params = { categorySlug: string; articleSlug: string; file: string }

export async function generateStaticParams() {
  return listMediaParams()
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { categorySlug, articleSlug, file } = await params
  const match = MEDIA_FILE_PATTERN.exec(file)
  const webp = match ? await findArticleMedia(safeDecode(categorySlug), safeDecode(articleSlug), match[1]) : null
  if (!webp) return new Response("Not found", { status: 404 })

  return new Response(new Uint8Array(webp), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(webp.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

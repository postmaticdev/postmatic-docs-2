import "server-only"

import { cache } from "react"

import {
  buildDocumentationCategories,
  buildNavigationSections,
  type DocumentationType,
  type RemoteDocumentation,
  type RemoteDocumentationCategory,
} from "@/lib/documentation-model"

// Default sama dengan proxy lama (vercel.json / vite.config.ts).
const API_ORIGIN = (
  process.env.API_ORIGIN?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.VITE_API_ORIGIN?.trim() ||
  "https://api-staging.postmatic.id"
).replace(/\/+$/, "")

export const DOCUMENTATION_REVALIDATE_SECONDS = 300
export const DOCUMENTATION_CACHE_TAG = "documentation"

type ApiResponse<T> = {
  data: T
  responseMessage?: string
  metaData?: { code?: number; message?: string }
}

class DocumentationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "DocumentationApiError"
  }
}

// Permintaan identik yang sedang berjalan di proses yang sama dipakai bersama.
// Artikel bergambar base64 bisa berukuran beberapa MB dan lambat diunduh,
// jadi jangan sampai diunduh berulang kali secara paralel saat build/revalidasi.
const inFlight = new Map<string, Promise<unknown>>()

function apiRequest<T>(path: string) {
  let request = inFlight.get(path) as Promise<T> | undefined
  if (!request) {
    request = sendRequest<T>(path).finally(() => inFlight.delete(path))
    inFlight.set(path, request)
  }
  return request
}

async function sendRequest<T>(path: string) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    headers: { accept: "application/json" },
    next: { revalidate: DOCUMENTATION_REVALIDATE_SECONDS, tags: [DOCUMENTATION_CACHE_TAG] },
    signal: AbortSignal.timeout(150_000),
  })
  const body = await response.text()
  let payload: ApiResponse<T> | null = null
  try {
    payload = JSON.parse(body) as ApiResponse<T>
  } catch (error) {
    console.error(`[docs] Respons API tidak valid (${response.status}, ${body.length} byte) untuk ${path}:`, error)
  }

  if (!response.ok || !payload) {
    throw new DocumentationApiError(
      payload?.responseMessage ||
        payload?.metaData?.message ||
        `Request failed with status ${response.status}`,
      response.status,
    )
  }

  return payload.data
}

const getTableOfContents = cache(async (type: DocumentationType) => {
  const data = await apiRequest<RemoteDocumentationCategory[] | null>(
    `/api/app/documentation/${type}-table-of-contents`,
  )
  return Array.isArray(data) ? data : []
})

// Kegagalan memuat daftar isi sengaja dilempar, bukan diganti daftar kosong:
// saat revalidasi ISR, Next tetap menyajikan halaman lama yang valid alih-alih
// meng-cache situs kosong (kategori 404, sidebar kosong, gambar 404).
export const getDocumentationIndex = cache(async () => {
  const [information, legality] = await Promise.all([
    getTableOfContents("information"),
    getTableOfContents("legality"),
  ])

  const categories = buildDocumentationCategories(information, legality)

  return {
    categories,
    articles: categories.flatMap((category) => category.articles),
    sections: buildNavigationSections(categories),
  }
})

export const getDocumentationArticle = cache(async (categorySlug: string, articleSlug: string) => {
  try {
    return await apiRequest<RemoteDocumentation | null>(
      `/api/app/documentation/article/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`,
    )
  } catch (error) {
    if (error instanceof DocumentationApiError && error.status === 404) return null
    throw error
  }
})

const configuredApiOrigin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim()
const API_ORIGIN = configuredApiOrigin || (import.meta.env.DEV ? "" : "https://api-staging.postmatic.id")

export type DocumentationType = "information" | "legality"

interface ApiResponse<T> {
  data: T
  responseMessage?: string
  metaData?: {
    code?: number
    message?: string
  }
  validationErrors?: unknown
}

export interface RemoteDocumentationTocArticle {
  id: number | string
  slug?: string | null
  title?: string | null
  description?: string | null
  icon?: string | null
  isActive?: boolean | null
}

export interface RemoteDocumentationCategory {
  id: number | string
  slug?: string | null
  name?: string | null
  type?: DocumentationType | string | null
  isActive?: boolean | null
  documentations?: RemoteDocumentationTocArticle[] | null
}

export interface RemoteDocumentation {
  id: number | string
  slug?: string | null
  title?: string | null
  description?: string | null
  icon?: string | null
  article?: string | null
  type?: DocumentationType | string | null
  category?: {
    id?: number | string | null
    slug?: string | null
    name?: string | null
    type?: DocumentationType | string | null
  } | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

function buildUrl(path: string) {
  return API_ORIGIN ? new URL(path, API_ORIGIN).toString() : path
}

function formatValidationErrors(validationErrors: unknown) {
  if (!validationErrors || typeof validationErrors !== "object") return ""

  return Object.entries(validationErrors as Record<string, unknown>)
    .map(([field, message]) => `${field}: ${String(message)}`)
    .join(", ")
}

async function apiRequest<T>(path: string, signal?: AbortSignal) {
  const response = await fetch(buildUrl(path), {
    cache: "no-store",
    signal,
  })
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload) {
    const validationMessage = formatValidationErrors(payload?.validationErrors)

    throw new Error(
      validationMessage ||
        payload?.responseMessage ||
        payload?.metaData?.message ||
        `Request failed with status ${response.status}`,
    )
  }

  return payload.data
}

export function getDocumentationTableOfContents(
  type: DocumentationType,
  signal?: AbortSignal,
) {
  return apiRequest<RemoteDocumentationCategory[]>(
    `/api/app/documentation/${type}-table-of-contents`,
    signal,
  )
}

export function getDocumentationArticleBySlug(
  categorySlug: string,
  articleSlug: string,
  signal?: AbortSignal,
) {
  return apiRequest<RemoteDocumentation>(
    `/api/app/documentation/article/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
      articleSlug,
    )}`,
    signal,
  )
}

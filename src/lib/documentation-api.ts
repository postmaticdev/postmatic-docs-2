import "server-only"

import { request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"
import { cache } from "react"

import type {
  DocumentationType,
  RemoteDocumentation,
  RemoteDocumentationCategory,
} from "@/lib/documentation-types"

interface ApiResponse<T> {
  data: T
  responseMessage?: string
  metaData?: {
    code?: number
    message?: string
  }
  validationErrors?: unknown
}

const API_ORIGIN =
  process.env.DOCUMENTATION_API_ORIGIN?.trim().replace(/\/$/, "") ||
  "https://api-staging.postmatic.id"

function formatValidationErrors(validationErrors: unknown) {
  if (!validationErrors || typeof validationErrors !== "object") return ""

  return Object.entries(validationErrors as Record<string, unknown>)
    .map(([field, message]) => `${field}: ${String(message)}`)
    .join(", ")
}

async function apiRequest<T>(path: string) {
  const url = new URL(`${API_ORIGIN}${path}`)
  const { status, body } = await requestJson(url)
  const payload = body as ApiResponse<T> | null

  if (status < 200 || status >= 300 || !payload || !("data" in payload)) {
    const validationMessage = formatValidationErrors(payload?.validationErrors)

    throw new Error(
      validationMessage ||
        payload?.responseMessage ||
        payload?.metaData?.message ||
        `Request failed with status ${status}`,
    )
  }

  return payload.data
}

function requestJson(url: URL) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const request = (url.protocol === "http:" ? httpRequest : httpsRequest)(
      url,
      { headers: { accept: "application/json" } },
      (response) => {
        const chunks: Buffer[] = []

        response.on("data", (chunk: Buffer) => chunks.push(chunk))
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8")
          let body: unknown = null

          try {
            body = text ? JSON.parse(text) : null
          } catch {
            body = null
          }

          resolve({ status: response.statusCode ?? 500, body })
        })
      },
    )

    request.setTimeout(30_000, () => {
      request.destroy(new Error(`Documentation API request timed out: ${url.pathname}`))
    })
    request.on("error", reject)
    request.end()
  })
}

export const getDocumentationTableOfContents = cache(
  async (type: DocumentationType) =>
    apiRequest<RemoteDocumentationCategory[]>(
      `/api/app/documentation/${type}-table-of-contents`,
    ),
)

export const getDocumentationIndex = cache(async () => {
  const [informationCategories, legalityCategories] = await Promise.all([
    getDocumentationTableOfContents("information"),
    getDocumentationTableOfContents("legality"),
  ])

  return { informationCategories, legalityCategories }
})

export const getDocumentationArticleBySlug = cache(
  async (categorySlug: string, articleSlug: string) =>
    apiRequest<RemoteDocumentation>(
      `/api/app/documentation/article/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
        articleSlug,
      )}`,
    ),
)

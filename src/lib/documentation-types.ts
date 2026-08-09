export type DocumentationType = "information" | "legality"

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
  type?: DocumentationType | null
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
  type?: DocumentationType | null
  category?: {
    id?: number | string | null
    slug?: string | null
    name?: string | null
    type?: DocumentationType | null
  } | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

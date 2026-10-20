import "server-only"

import render from "dom-serializer"
import { Element, isTag, isText, type ChildNode, type Document } from "domhandler"
import { findAll, removeElement, replaceElement, textContent } from "domutils"
import { parseDocument } from "htmlparser2"
import sanitizeHtml from "sanitize-html"

import { RESERVED_ELEMENT_IDS, slugify, type HeadingItem } from "@/lib/documentation-model"
import { domToMarkdown } from "@/lib/documentation-markdown"
import { createMediaHref, decodeDataImage, readImageSize } from "@/lib/documentation-media"
import { SITE_URL } from "@/lib/site-config"

export type ArticleSection = {
  id: string
  title: string
  text: string
}

export type ProcessedArticleHtml = {
  html: string
  headings: HeadingItem[]
  sections: ArticleSection[]
  markdown: string
  images: Map<string, Buffer>
}

const ADMONITION_CLASSES = [
  "admonition-card",
  "info",
  "note",
  "tip",
  "warning",
  "caution",
  "adm-header",
  "adm-content",
]

const BUTTON_CLASSES = [
  "docs-btn",
  "docs-btn-blue",
  "docs-btn-yellow",
  "docs-btn-red",
  "docs-btn-green",
  "docs-btn-grey",
]

const LENGTH = /^\d{1,4}(\.\d+)?(px|%)$/
const MARGIN = /^(auto|0|\d{1,3}(\.\d+)?px)(\s+(auto|0|\d{1,3}(\.\d+)?px)){0,3}$/

// Allowlist ketat: hanya elemen yang dihasilkan editor dokumentasi.
// Script, style, iframe, form, svg, event handler dan URL javascript: terbuang di sini.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "b", "em", "i", "u", "s",
    "del", "mark", "sub", "sup", "code", "pre", "blockquote", "ul", "ol", "li", "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "class"],
    img: ["src", "alt", "title", "width", "style"],
    ol: ["start"],
    th: ["colspan", "rowspan", "style"],
    td: ["colspan", "rowspan", "style"],
    p: ["style"],
    li: ["style"],
    h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"], h5: ["style"], h6: ["style"],
    div: ["class"],
    span: ["class"],
  },
  allowedClasses: {
    div: ADMONITION_CLASSES,
    span: ADMONITION_CLASSES,
    a: BUTTON_CLASSES,
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https", "data"] },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
    img: {
      width: [LENGTH],
      margin: [MARGIN],
      "margin-left": [MARGIN],
      "margin-right": [MARGIN],
    },
  },
  disallowedTagsMode: "discard",
}

const SITE_HOST = new URL(SITE_URL).host

function collapse(value: string) {
  return value.replace(/[\s ]+/g, " ").trim()
}

// Buang spasi/titik dua di akhir ("Langkah Selanjutnya:"). Loop linear, bukan
// regex `[\s:]+$` yang kuadratik pada input panjang.
function trimHeadingText(value: string) {
  let end = value.length
  while (end > 0 && (value[end - 1] === ":" || /\s/.test(value[end - 1]))) end -= 1
  return value.slice(0, end)
}

function isBlank(node: ChildNode) {
  return (isText(node) && !collapse(node.data)) || (isTag(node) && node.name === "br")
}

function createElement(name: string, attribs: Record<string, string>, children: ChildNode[] = []) {
  const element = new Element(name, attribs, children)
  for (const child of children) child.parent = element
  children.forEach((child, index) => {
    child.prev = children[index - 1] ?? null
    child.next = children[index + 1] ?? null
  })
  return element
}

function readStyle(element: Element) {
  return Object.fromEntries(
    (element.attribs.style ?? "")
      .split(";")
      .map((declaration) => declaration.split(":").map((part) => part.trim().toLowerCase()))
      .filter((pair): pair is [string, string] => pair.length === 2 && Boolean(pair[0] && pair[1])),
  )
}

function normalizeHeadings(document: Document) {
  for (const element of findAll((el) => /^h[1-6]$/.test(el.name), document.children)) {
    const level = Number(element.name[1])
    // Judul halaman sudah h1, jadi heading konten mulai dari h2.
    element.name = level <= 2 ? "h2" : level === 3 ? "h3" : "h4"
  }
}

// Editor sering memakai paragraf tebal sebagai sub-judul ("Langkah Selanjutnya:").
// Jadikan h4 agar struktur dokumen dan daftar isi benar; tampilannya tetap tebal.
function promotePseudoHeadings(document: Document) {
  for (const node of [...document.children]) {
    if (!isTag(node) || node.name !== "p") continue

    const meaningful = node.children.filter((child) => !isBlank(child))
    const [only] = meaningful
    if (meaningful.length !== 1 || !isTag(only) || (only.name !== "strong" && only.name !== "b")) continue

    const text = collapse(textContent(only))
    if (text.length === 0 || text.length > 120) continue

    replaceElement(node, createElement("h4", {}, [...only.children]))
  }
}

function removeEmptyParagraphs(document: Document) {
  for (const paragraph of findAll((el) => el.name === "p", document.children)) {
    while (paragraph.children[0] && isBlank(paragraph.children[0])) removeElement(paragraph.children[0])
    while (paragraph.children.at(-1) && isBlank(paragraph.children.at(-1)!)) {
      removeElement(paragraph.children.at(-1)!)
    }

    const hasMedia = findAll((el) => el.name === "img", paragraph.children).length > 0
    if (!hasMedia && !collapse(textContent(paragraph))) removeElement(paragraph)
  }
}

function isBoldOnly(cell: Element) {
  if (!collapse(textContent(cell))) return false

  const plainText = (nodes: ChildNode[]): boolean =>
    nodes.some((node) => {
      if (isText(node)) return Boolean(collapse(node.data))
      if (!isTag(node) || node.name === "strong" || node.name === "b") return false
      return plainText(node.children)
    })

  return !plainText(cell.children)
}

function normalizeTables(document: Document) {
  for (const table of findAll((el) => el.name === "table", document.children)) {
    for (const child of [...table.children]) {
      if (isTag(child) && child.name === "colgroup") removeElement(child)
    }

    const rows = findAll((el) => el.name === "tr", table.children)
    const [firstRow] = rows
    const headerCells = firstRow?.children.filter(isTag) ?? []
    const hasHead = findAll((el) => el.name === "thead", table.children).length > 0

    if (!hasHead && rows.length > 1 && headerCells.length > 1 && headerCells.every(isBoldOnly)) {
      for (const cell of headerCells) {
        cell.name = "th"
        cell.attribs.scope = "col"
      }
      removeElement(firstRow)
      const thead = createElement("thead", {}, [firstRow])
      const firstChild = table.children[0]
      if (firstChild) {
        firstChild.prev = thead
        thead.next = firstChild
      }
      thead.parent = table
      table.children.unshift(thead)
    }

    for (const cell of findAll((el) => el.name === "td" || el.name === "th", table.children)) {
      if (cell.attribs.colspan === "1") delete cell.attribs.colspan
      if (cell.attribs.rowspan === "1") delete cell.attribs.rowspan
    }

    const wrapper = createElement("div", {
      class: "docs-table",
      role: "region",
      "aria-label": "Tabel",
      tabindex: "0",
    })
    replaceElement(table, wrapper)
    table.parent = wrapper
    table.prev = null
    table.next = null
    wrapper.children.push(table)
  }
}

async function normalizeImages(document: Document, articleTitle: string, location: ArticleLocation) {
  const images = new Map<string, Buffer>()
  let index = 0

  for (const image of findAll((el) => el.name === "img", document.children)) {
    const src = image.attribs.src ?? ""
    const style = readStyle(image)
    const attribs: Record<string, string> = {
      alt: collapse(image.attribs.alt ?? "") || `Ilustrasi ${articleTitle}`,
      decoding: "async",
      class: "docs-image",
    }

    if (/^\s*data:/i.test(src)) {
      const decoded = decodeDataImage(src)
      const size = decoded ? await readImageSize(decoded.data).catch(() => null) : null
      if (!decoded || !size) {
        removeElement(image)
        continue
      }

      images.set(decoded.hash, decoded.data)
      attribs.src = createMediaHref(location.categorySlug, location.articleSlug, decoded.hash)
      attribs.width = String(size.width)
      attribs.height = String(size.height)
    } else {
      attribs.src = src
    }

    // Lebar dari editor ("75%") dipertahankan; gambar pertama diprioritaskan
    // (bukan lazy) karena biasanya menjadi elemen LCP.
    const width = image.attribs.width?.endsWith("%") ? image.attribs.width : style.width
    if (width && LENGTH.test(width) && width !== "100%") attribs.style = `width:${width}`

    const margin = style.margin ?? ""
    const centered =
      margin.split(/\s+/)[1] === "auto" ||
      (style["margin-left"] === "auto" && style["margin-right"] === "auto")
    if (centered) attribs.class += " docs-image-center"

    if (index === 0) attribs.fetchpriority = "high"
    else attribs.loading = "lazy"
    index += 1
    image.attribs = attribs
  }

  return images
}

function normalizeLinks(document: Document) {
  for (const link of findAll((el) => el.name === "a", document.children)) {
    const href = link.attribs.href
    if (!href) continue

    let url: URL
    try {
      url = new URL(href, SITE_URL)
    } catch {
      delete link.attribs.href
      continue
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") continue

    if (url.host === SITE_HOST) {
      // Path "//evil.com" akan dibaca browser sebagai URL ke host lain.
      link.attribs.href = `${url.pathname.replace(/^\/+/, "/")}${url.search}${url.hash}`
      continue
    }

    const isPostmatic = url.hostname === "postmatic.id" || url.hostname.endsWith(".postmatic.id")
    if (isPostmatic) url.protocol = "https:"

    link.attribs.href = url.toString()
    link.attribs.target = "_blank"
    link.attribs.rel = isPostmatic ? "noopener" : "noopener noreferrer nofollow"
  }
}

// Rapatkan level heading agar tidak melompat (mis. h1 → h4 bila artikel hanya
// punya sub-judul tebal): level yang dipakai dipetakan berurutan mulai h2.
function compactHeadingLevels(document: Document) {
  const headings = findAll((el) => el.name === "h2" || el.name === "h3" || el.name === "h4", document.children)
  const levels = [...new Set(headings.map((heading) => Number(heading.name[1])))].sort()

  for (const heading of headings) {
    heading.name = `h${2 + levels.indexOf(Number(heading.name[1]))}`
  }
}

function assignHeadingIds(document: Document) {
  const used = new Set<string>(RESERVED_ELEMENT_IDS)

  return findAll((el) => el.name === "h2" || el.name === "h3" || el.name === "h4", document.children).map(
    (element, index) => {
      const text = collapse(textContent(element))
      const base = slugify(text, `bagian-${index + 1}`)
      let id = base
      for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`
      used.add(id)
      element.attribs.id = id

      return {
        id,
        title: trimHeadingText(text) || `Bagian ${index + 1}`,
        level: Number(element.name[1]),
      } satisfies HeadingItem
    },
  )
}

const BLOCK_TAGS = new Set(["p", "li", "td", "th", "tr", "div", "h2", "h3", "h4", "br", "ul", "ol", "table", "blockquote", "pre"])

// textContent menggabungkan sel tabel/paragraf tanpa spasi ("PremiumBatas");
// beri pemisah di antara elemen blok.
function readableText(node: ChildNode): string {
  if (isText(node)) return node.data
  if (!isTag(node)) return ""
  const text = node.children.map(readableText).join("")
  return BLOCK_TAGS.has(node.name) ? ` ${text} ` : text
}

function collectSections(document: Document, articleTitle: string) {
  const sections: ArticleSection[] = []
  let current: ArticleSection = { id: "", title: articleTitle, text: "" }

  const visit = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (isTag(node) && /^h[234]$/.test(node.name) && node.attribs.id) {
        sections.push(current)
        current = {
          id: node.attribs.id,
          title: trimHeadingText(collapse(textContent(node))),
          text: "",
        }
      } else if (isTag(node) && node.name === "div") {
        visit(node.children)
      } else {
        current.text += ` ${readableText(node)}`
      }
    }
  }

  visit(document.children)
  sections.push(current)

  return sections
    .map((section) => ({ ...section, text: collapse(section.text) }))
    .filter((section) => section.id || section.text)
}

export type ArticleLocation = { categorySlug: string; articleSlug: string }

export async function processArticleHtml(
  rawHtml: string | null | undefined,
  articleTitle: string,
  location: ArticleLocation,
): Promise<ProcessedArticleHtml> {
  const clean = sanitizeHtml(rawHtml?.trim() ?? "", SANITIZE_OPTIONS)
  const document = parseDocument(clean)

  normalizeHeadings(document)
  promotePseudoHeadings(document)
  removeEmptyParagraphs(document)
  normalizeTables(document)
  normalizeLinks(document)
  const images = await normalizeImages(document, articleTitle, location)
  compactHeadingLevels(document)
  const headings = assignHeadingIds(document)

  return {
    html: render(document, { encodeEntities: "utf8" }),
    headings,
    sections: collectSections(document, articleTitle),
    markdown: domToMarkdown(document.children, SITE_URL),
    images,
  }
}

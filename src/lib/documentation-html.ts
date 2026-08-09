import "server-only"

import * as cheerio from "cheerio"

import { slugify, type HeadingItem } from "@/lib/documentation-model"

export function prepareArticleHtml(source?: string | null) {
  const sourceHtml = source?.trim() || ""
  if (!sourceHtml) return { html: "", headings: [] as HeadingItem[] }

  const $ = cheerio.load(sourceHtml, null, false)

  $("script").remove()
  $("*").each((_, element) => {
    if (!("attribs" in element)) return

    for (const attribute of Object.keys(element.attribs)) {
      if (attribute.toLowerCase().startsWith("on")) {
        $(element).removeAttr(attribute)
      }
    }
  })

  const usedIds = new Set<string>()
  const headings: HeadingItem[] = []

  $("h2, h3").each((index, element) => {
    const level = element.tagName.toLowerCase() === "h3" ? 3 : 2
    const title = $(element).text().trim() || `Section ${index + 1}`
    const existingId = $(element).attr("id")?.trim() || ""
    const baseId = existingId || slugify(title, `section-${index + 1}`)
    let id = baseId
    let suffix = 2

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    usedIds.add(id)
    $(element).attr("id", id)
    headings.push({ id, title, level })
  })

  return {
    html: $.root().html() ?? "",
    headings,
  }
}

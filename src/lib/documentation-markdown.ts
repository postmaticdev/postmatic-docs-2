import "server-only"

import { isTag, isText, type ChildNode, type Element } from "domhandler"
import { textContent } from "domutils"

// Konversi HTML artikel (yang sudah disanitasi) ke Markdown untuk llms-full.txt.
// Cukup untuk elemen yang dihasilkan editor dokumentasi; elemen lain jatuh ke teks biasa.

function collapse(value: string) {
  return value.replace(/\s+/g, " ")
}

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|").trim()
}

function inline(nodes: ChildNode[], siteUrl: string): string {
  return nodes
    .map((node) => {
      if (isText(node)) return collapse(node.data)
      if (!isTag(node)) return ""

      const content = inline(node.children, siteUrl)
      switch (node.name) {
        case "strong":
        case "b":
          return content.trim() ? `**${content.trim()}**` : ""
        case "em":
        case "i":
          return content.trim() ? `*${content.trim()}*` : ""
        case "code":
          return `\`${textContent(node)}\``
        case "br":
          return "  \n"
        case "a": {
          const href = node.attribs.href
          if (!href) return content
          const absolute = href.startsWith("/") ? `${siteUrl}${href}` : href
          return `[${content.trim() || absolute}](${absolute})`
        }
        case "img": {
          const src = node.attribs.src ?? ""
          const absolute = src.startsWith("/") ? `${siteUrl}${src}` : src
          return `![${node.attribs.alt ?? ""}](${absolute})`
        }
        default:
          return content
      }
    })
    .join("")
}

function list(element: Element, siteUrl: string, depth: number): string {
  const ordered = element.name === "ol"
  let index = Number(element.attribs.start) || 1

  return element.children
    .filter((child): child is Element => isTag(child) && child.name === "li")
    .map((item) => {
      const marker = ordered ? `${index++}.` : "-"
      const nested = item.children.filter(
        (child): child is Element => isTag(child) && (child.name === "ul" || child.name === "ol"),
      )
      const body = item.children.filter((child) => !nested.includes(child as Element))
      const text = blocks(body, siteUrl, depth + 1).replace(/\n{2,}/g, " ").trim()
      const children = nested.map((child) => list(child, siteUrl, depth + 1)).join("\n")
      return `${"  ".repeat(depth)}${marker} ${text}${children ? `\n${children}` : ""}`
    })
    .join("\n")
}

function table(element: Element) {
  const rows = (function collect(nodes: ChildNode[]): Element[] {
    return nodes.flatMap((node) => {
      if (!isTag(node)) return []
      if (node.name === "tr") return [node]
      return collect(node.children)
    })
  })(element.children)

  const cells = rows.map((row) =>
    row.children
      .filter((cell): cell is Element => isTag(cell) && (cell.name === "td" || cell.name === "th"))
      .map((cell) => escapeTableCell(collapse(textContent(cell)))),
  )
  if (cells.length === 0) return ""

  const width = Math.max(...cells.map((row) => row.length))
  const pad = (row: string[]) => [...row, ...Array(width - row.length).fill("")]
  const [head, ...body] = cells

  return [
    `| ${pad(head).join(" | ")} |`,
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...body.map((row) => `| ${pad(row).join(" | ")} |`),
  ].join("\n")
}

function blocks(nodes: ChildNode[], siteUrl: string, depth = 0): string {
  const output: string[] = []
  let buffer: ChildNode[] = []

  const flush = () => {
    const text = inline(buffer, siteUrl).trim()
    if (text) output.push(text)
    buffer = []
  }

  for (const node of nodes) {
    if (!isTag(node)) {
      buffer.push(node)
      continue
    }

    switch (node.name) {
      case "h2":
      case "h3":
      case "h4": {
        flush()
        const level = Number(node.name[1])
        output.push(`${"#".repeat(level)} ${collapse(textContent(node)).trim()}`)
        break
      }
      case "p":
        flush()
        output.push(inline(node.children, siteUrl).trim())
        break
      case "ul":
      case "ol":
        flush()
        output.push(list(node, siteUrl, depth))
        break
      case "table":
        flush()
        output.push(table(node))
        break
      case "blockquote":
        flush()
        output.push(
          blocks(node.children, siteUrl, depth)
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n"),
        )
        break
      case "pre":
        flush()
        output.push(`\`\`\`\n${textContent(node).replace(/\n$/, "")}\n\`\`\``)
        break
      case "hr":
        flush()
        output.push("---")
        break
      case "div":
        flush()
        output.push(blocks(node.children, siteUrl, depth))
        break
      default:
        buffer.push(node)
    }
  }

  flush()
  return output.filter(Boolean).join("\n\n")
}

export function domToMarkdown(nodes: ChildNode[], siteUrl: string) {
  return blocks(nodes, siteUrl).replace(/\n{3,}/g, "\n\n").trim()
}

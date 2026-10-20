import { buildSearchIndex } from "@/lib/documentation-content"

export const revalidate = 300

export async function GET() {
  return Response.json(await buildSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400" },
  })
}

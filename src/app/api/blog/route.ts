import { NextResponse } from "next/server"
import { listPublished } from "@/lib/blog-store"
import { readAuthors } from "@/lib/authors-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limitParam = url.searchParams.get("limit")
  const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam))) : null

  const all = await listPublished()
  const posts = limit ? all.slice(0, limit) : all

  // Only include authors actually referenced by the returned posts —
  // keeps the payload tight when callers ask for a small slice.
  const referenced = new Set(posts.map((p) => p.authorId).filter(Boolean))
  const { authors } = await readAuthors()
  const authorsById = Object.fromEntries(
    authors.filter((a) => referenced.has(a.id)).map((a) => [a.id, a]),
  )

  return NextResponse.json(
    { posts, authors: authorsById },
    { headers: { "Cache-Control": "no-store" } },
  )
}

import { NextResponse } from "next/server"
import { readLegalPages } from "@/lib/legal-store"

export const dynamic = "force-dynamic"

// Public list — used by the SiteFooter to render the picker-selected
// legal-page links. Body is included so future callers can render the
// full text without a second request, but it's small for a footer
// payload (a couple of policies at most).
export async function GET() {
  const data = await readLegalPages()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

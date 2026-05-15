import { NextResponse } from "next/server"
import { isReviewVisible, readReviews } from "@/lib/reviews-store"

export const dynamic = "force-dynamic"

// Public endpoint the homepage testimonials carousel uses. Returns the
// active source plus — for the "real" mode — the filtered, visible
// reviews. We pre-filter on the server so the client doesn't have to
// know about the minStars / publishOverride rules.
export async function GET() {
  const data = await readReviews()
  const visibleReviews = data.reviews
    .filter((r) => isReviewVisible(r, data.minStars))
    .map(({ id, author, authorPhotoUrl, rating, text, date }) => ({
      id,
      author,
      authorPhotoUrl,
      rating,
      text,
      date,
    }))

  return NextResponse.json(
    { source: data.source, reviews: visibleReviews },
    { headers: { "Cache-Control": "no-store" } },
  )
}

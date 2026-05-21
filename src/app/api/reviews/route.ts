import { NextResponse } from "next/server"
import { isReviewVisible, readReviews } from "@/lib/reviews-store"

export const dynamic = "force-dynamic"

// Public endpoint the homepage testimonials carousel uses. Filtreyi sunucu
// tarafında uyguluyoruz — minStars / publishOverride kuralları client'a
// sızmaması için. Özet kartı (puan, yorum sayısı, firma adı, "tümünü gör"
// linki) de aynı yanıttan geliyor.
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
    { summary: data.summary, reviews: visibleReviews },
    { headers: { "Cache-Control": "no-store" } },
  )
}

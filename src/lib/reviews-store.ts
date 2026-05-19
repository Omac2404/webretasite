// File-based store for testimonials. Tüm yorumlar admin tarafından elle
// giriliyor; her yoruma orijinal Google linki eklenebiliyor. Üstteki özet
// kartı (rating / yorum sayısı / firma adı / "tümünü gör" linki) da admin
// tarafından düzenleniyor.

import { promises as fs } from "node:fs"
import path from "node:path"

export type Review = {
  id: string
  author: string
  authorPhotoUrl?: string
  rating: number // 1..5
  text: string
  // Görüntülenecek tarih — serbest metin. ISO de Google'ın "2 ay önce" de
  // olabilir; ne yapıştırılırsa o gösterilir.
  date: string
  // Yorumun orijinal kaynağına (Google review URL'i) link. Boşsa karttaki
  // Google ikonu link olarak değil dekoratif olarak render edilir.
  sourceUrl?: string
  // Manuel override: null = minStars filtresine uy, true = her zaman göster,
  // false = her zaman gizle.
  publishOverride: boolean | null
  createdAt: string // ISO — store'a düştüğü an
}

export type ReviewsSummary = {
  // 0..5 — admin "5.0" gibi girer, ondalık tutuluyor
  rating: number
  // Toplam yorum sayısı — "85" gibi
  reviewCount: number
  // "Webreta Web Teknolojileri" — özet kartının altında çıkar
  businessName: string
  // "Tüm yorumları gör" butonu ve özet kartı tıklanınca açılan URL
  reviewsUrl: string
}

export type ReviewsData = {
  minStars: number // 0..5
  summary: ReviewsSummary
  reviews: Review[]
}

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json")

export const DEFAULT_SUMMARY: ReviewsSummary = {
  rating: 5.0,
  reviewCount: 0,
  businessName: "Webreta Web Teknolojileri",
  reviewsUrl: "",
}

const EMPTY: ReviewsData = {
  minStars: 4,
  summary: { ...DEFAULT_SUMMARY },
  reviews: [],
}

function clampStars(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 5) return 5
  return Math.round(n)
}

function clampRating(value: unknown): number {
  const n = clampStars(value)
  return n < 1 ? 1 : n
}

// Özet kart için ondalıklı rating (4.8 gibi) tutmak gerek. clampRating'in
// 1..5 integer halini değil, 0..5 float halini istiyoruz.
function clampSummaryRating(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 5) return 5
  return Math.round(n * 10) / 10
}

function clampCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

function normalizeOverride(value: unknown): boolean | null {
  if (value === true) return true
  if (value === false) return false
  return null
}

function normalizeSummary(raw: Partial<ReviewsSummary> | undefined): ReviewsSummary {
  if (!raw) return { ...DEFAULT_SUMMARY }
  return {
    rating: clampSummaryRating(raw.rating ?? DEFAULT_SUMMARY.rating),
    reviewCount: clampCount(raw.reviewCount ?? DEFAULT_SUMMARY.reviewCount),
    businessName: String(raw.businessName ?? DEFAULT_SUMMARY.businessName),
    reviewsUrl: String(raw.reviewsUrl ?? DEFAULT_SUMMARY.reviewsUrl),
  }
}

export async function readReviews(): Promise<ReviewsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<ReviewsData> & {
      reviews?: Array<Partial<Review>>
    }
    return {
      minStars: clampStars(parsed.minStars),
      summary: normalizeSummary(parsed.summary),
      reviews: Array.isArray(parsed.reviews)
        ? parsed.reviews.map((r) => ({
            id: String(r.id ?? ""),
            author: String(r.author ?? ""),
            authorPhotoUrl: r.authorPhotoUrl
              ? String(r.authorPhotoUrl)
              : undefined,
            rating: clampRating(r.rating),
            text: String(r.text ?? ""),
            date: String(r.date ?? ""),
            sourceUrl: r.sourceUrl ? String(r.sourceUrl) : undefined,
            publishOverride: normalizeOverride(r.publishOverride),
            createdAt: String(r.createdAt ?? new Date().toISOString()),
          }))
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return EMPTY
    throw err
  }
}

async function writeReviews(data: ReviewsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function setMinStars(minStars: number): Promise<void> {
  const data = await readReviews()
  data.minStars = clampStars(minStars)
  await writeReviews(data)
}

export async function setSummary(summary: ReviewsSummary): Promise<void> {
  const data = await readReviews()
  data.summary = normalizeSummary(summary)
  await writeReviews(data)
}

export async function addManualReview(input: {
  author: string
  rating: number
  text: string
  date: string
  sourceUrl?: string
}): Promise<Review> {
  const data = await readReviews()
  const review: Review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: input.author,
    rating: clampRating(input.rating),
    text: input.text,
    date: input.date,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    publishOverride: null,
    createdAt: new Date().toISOString(),
  }
  data.reviews.unshift(review)
  await writeReviews(data)
  return review
}

export async function deleteReview(id: string): Promise<void> {
  const data = await readReviews()
  data.reviews = data.reviews.filter((r) => r.id !== id)
  await writeReviews(data)
}

export async function setPublishOverride(
  id: string,
  value: boolean | null,
): Promise<void> {
  const data = await readReviews()
  const review = data.reviews.find((r) => r.id === id)
  if (!review) return
  review.publishOverride = value
  await writeReviews(data)
}

// Tek bir yorumun aktif minStars filtresi altında görünür olup olmadığını
// karara bağla. Manuel override öncelikli; yoksa rating eşiğe uymalı.
export function isReviewVisible(review: Review, minStars: number): boolean {
  if (review.publishOverride === true) return true
  if (review.publishOverride === false) return false
  return review.rating >= minStars
}

// File-based store for testimonials. Two modes:
//   - "preset": the 20 hardcoded testimonials in page.tsx are shown
//   - "real":   reviews curated below (manual entries + future Google sync)
//
// The Google Business Profile sync isn't wired yet — it's a Phase-2 task
// once the OAuth + Google Cloud setup is done. For now the admin can
// add reviews manually so the moderation UI is usable.

import { promises as fs } from "node:fs"
import path from "node:path"

export type ReviewSource = "preset" | "real"
export type ReviewOrigin = "google" | "manual"

export type Review = {
  id: string
  origin: ReviewOrigin
  // For Google reviews this is the original Google review id, useful
  // for de-duplicating on sync. Empty for manual entries.
  externalId?: string
  author: string
  authorPhotoUrl?: string
  rating: number // 1..5
  text: string
  // Display date — kept as a free string so we can pass through Google's
  // relative phrasing ("2 ay önce") if we want, or use an ISO date for
  // manual entries.
  date: string
  // Manual override: null = follow minStars filter, true = always show,
  // false = always hide regardless of minStars.
  publishOverride: boolean | null
  createdAt: string // ISO — when the entry landed in our store
}

export type ReviewsData = {
  source: ReviewSource
  minStars: number // 0..5
  googleConnected: boolean
  lastGoogleSyncAt: string | null
  reviews: Review[]
}

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json")

const EMPTY: ReviewsData = {
  source: "preset",
  minStars: 4,
  googleConnected: false,
  lastGoogleSyncAt: null,
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

function normalizeOrigin(value: unknown): ReviewOrigin {
  return value === "google" ? "google" : "manual"
}

function normalizeOverride(value: unknown): boolean | null {
  if (value === true) return true
  if (value === false) return false
  return null
}

export async function readReviews(): Promise<ReviewsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<ReviewsData> & {
      reviews?: Array<Partial<Review>>
    }
    return {
      source: parsed.source === "real" ? "real" : "preset",
      minStars: clampStars(parsed.minStars),
      googleConnected: Boolean(parsed.googleConnected),
      lastGoogleSyncAt:
        typeof parsed.lastGoogleSyncAt === "string"
          ? parsed.lastGoogleSyncAt
          : null,
      reviews: Array.isArray(parsed.reviews)
        ? parsed.reviews.map((r) => ({
            id: String(r.id ?? ""),
            origin: normalizeOrigin(r.origin),
            externalId: r.externalId ? String(r.externalId) : undefined,
            author: String(r.author ?? ""),
            authorPhotoUrl: r.authorPhotoUrl
              ? String(r.authorPhotoUrl)
              : undefined,
            rating: clampRating(r.rating),
            text: String(r.text ?? ""),
            date: String(r.date ?? ""),
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

export async function setReviewSource(source: ReviewSource): Promise<void> {
  const data = await readReviews()
  data.source = source
  await writeReviews(data)
}

export async function setMinStars(minStars: number): Promise<void> {
  const data = await readReviews()
  data.minStars = clampStars(minStars)
  await writeReviews(data)
}

export async function addManualReview(input: {
  author: string
  rating: number
  text: string
  date: string
}): Promise<Review> {
  const data = await readReviews()
  const review: Review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    origin: "manual",
    author: input.author,
    rating: clampRating(input.rating),
    text: input.text,
    date: input.date,
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

// Decide whether a single review should be visible given the current
// minStars filter. Manual overrides win; otherwise the rating must
// meet the threshold.
export function isReviewVisible(review: Review, minStars: number): boolean {
  if (review.publishOverride === true) return true
  if (review.publishOverride === false) return false
  return review.rating >= minStars
}

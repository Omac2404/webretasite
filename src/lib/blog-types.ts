// Blog post types. No `node:fs` here so the file is safe to import from
// client components.

// Turkish-aware slugifier — shared by the server store and client-side
// previews (e.g. the SEO checklist that needs to know the upcoming URL
// before save). Server adds a uniqueness suffix on top.
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "yazi"
  )
}

export type CategoryKey = "teknik" | "haberler"

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "teknik", label: "Teknik" },
  { key: "haberler", label: "Bizden Haberler" },
]

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Teknik"
}

export type BlogPostSeo = {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  focusKeyword: string
  ogImage: string
  noindex: boolean
  includeInSitemap: boolean
}

export type BlogPost = {
  id: string
  authorId: string
  category: CategoryKey
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  createdAt: string
  updatedAt: string
  // True = visible (subject to publishAt check). False = hard draft.
  published: boolean
  // Optional ISO datetime — when set in the future the post stays hidden
  // from public listings until that moment passes. Empty string = no
  // schedule (uses `published` directly).
  publishAt?: string
  seo?: BlogPostSeo
}

// True when the post is publishable right now: explicitly published and
// either no scheduled time or the schedule is already in the past.
export function isPostLive(post: BlogPost, now: Date = new Date()): boolean {
  if (!post.published) return false
  if (!post.publishAt) return true
  const t = new Date(post.publishAt).getTime()
  if (Number.isNaN(t)) return true
  return t <= now.getTime()
}

export type BlogData = {
  posts: BlogPost[]
}

// Estimate reading time from a content string, rounded up.
export function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// Pull a short excerpt from the content if the author didn't write one.
export function deriveExcerpt(content: string, max = 180): string {
  const flat = content.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  return flat.slice(0, max).replace(/\s+\S*$/, "") + "…"
}

// Format an ISO date as "12 Mayıs 2026" for display.
const TR_MONTHS_LONG = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
]

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getDate()} ${TR_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

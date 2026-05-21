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
  published: boolean
  seo?: BlogPostSeo
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

// Legal-page types & format helpers. No `node:fs` here — safe to import
// from client components.

export type LegalPage = {
  id: string
  slug: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export type LegalPagesData = {
  pages: LegalPage[]
}

// Public URL for a legal page. Centralised so the admin link, the
// footer link and the public renderer all use the same shape.
export function legalPageHref(slug: string): string {
  return `/yasal/${slug}`
}

// Turkish-aware slugifier (same rules as the blog store) — kept here so
// the client form can preview the slug without round-tripping to the
// server.
export function slugifyLegal(input: string): string {
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
      .slice(0, 80) || "sayfa"
  )
}

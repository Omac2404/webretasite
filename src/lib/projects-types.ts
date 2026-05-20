// Project types & format helpers. No `node:fs` here so the file is safe
// to import from client components.

export type ProjectCategory = "dev" | "ops"

export const PROJECT_CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: "dev", label: "Geliştirmeler" },
  { key: "ops", label: "Operasyonlar" },
]

export function categoryLabel(key: string): string {
  return PROJECT_CATEGORIES.find((c) => c.key === key)?.label ?? "Geliştirmeler"
}

export type Project = {
  id: string
  // ID of the referans (logo) entry — used to look up name + logo image.
  companyId: string
  category: ProjectCategory
  // Free-form chip text shown on the card, e.g. "Web Sitesi", "E-Ticaret".
  type: string
  // ISO date (YYYY-MM-DD). Rendered as "5 Mart 2025" on the card/popup.
  publishDate: string
  // Short copy shown on the card next to the Talep/Çözüm pills.
  demand: string
  solution: string
  // Long copy shown in the hover/tap popup.
  demandDetail: string
  solutionDetail: string
  createdAt: string
  updatedAt: string
}

// Right-column sidebar for the "Neler Yaptık?" homepage section —
// approach blurb + CTA, shown beside the projects carousel on desktop.
// Admin-managed via /admin/projeler.
export type ProjectsSidebar = {
  titleLeading: string
  titleHighlight: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export const DEFAULT_PROJECTS_SIDEBAR: ProjectsSidebar = {
  titleLeading: "Her projeye sıfırdan,",
  titleHighlight: "ihtiyaca özel.",
  description:
    "Hazır şablon kullanmıyoruz. Talebinizi dinleyip size özel çözüm kurguluyoruz; web sitesinden eklentiye, sunucu taşımadan güvenlik kurulumuna kadar her adımı sizin işinize göre tasarlıyoruz.",
  ctaLabel: "Teklif al",
  ctaHref: "#teklif",
}

export type ProjectsData = {
  projects: Project[]
  sidebar?: ProjectsSidebar
}

// Derive 2-letter initials from a company name (e.g. "Aksel & Partners" → "AP").
// Used by the card placeholder when no logo image exists for the referans.
export function deriveInitials(name: string): string {
  const words = name
    .replace(/[&]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Turkish long month names for date formatting.
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

// Format an ISO date (YYYY-MM-DD) as "5 Mart 2025".
export function formatPublishDate(iso: string): string {
  if (!iso) return ""
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const monthName = TR_MONTHS_LONG[m - 1] ?? ""
  return `${d} ${monthName} ${y}`
}

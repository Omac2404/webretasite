// SEO types. Pure types only — safe to import from client components.

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

export const CHANGE_FREQS: ChangeFreq[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]

export type GlobalSeo = {
  siteName: string
  siteUrl: string
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultKeywords: string[]
  defaultOgImage: string
  twitterHandle: string
}

export type PageSeo = {
  title: string
  description: string
  keywords: string[]
  ogImage: string
  noindex: boolean
  includeInSitemap: boolean
  priority: number
  changefreq: ChangeFreq
}

export type SeoData = {
  global: GlobalSeo
  pages: Record<string, PageSeo>
  sitemap: {
    includeLegalPages: boolean
    extraUrls: string[]
  }
}

export type BlogSeo = {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  focusKeyword: string
  ogImage: string
  noindex: boolean
  includeInSitemap: boolean
}

export const EMPTY_BLOG_SEO: BlogSeo = {
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  focusKeyword: "",
  ogImage: "",
  noindex: false,
  includeInSitemap: true,
}

// Pages that can have per-page SEO managed via /admin/seo. Blog posts
// have their own SEO inside the blog editor.
export type SeoPageEntry = { href: string; label: string }

export const SEO_MANAGED_PAGES: SeoPageEntry[] = [
  { href: "/", label: "Anasayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/web-site", label: "Web Site" },
  { href: "/dijital-reklamlar", label: "Dijital Reklamlar" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
]

// Dynamic sitemap. Combines admin-toggled static pages (read from the
// SEO store) with every published blog post. Legal pages are excluded
// by default — admin can opt them back in via /admin/seo.

import type { MetadataRoute } from "next"
import { readSeo } from "@/lib/seo-store"
import { listPublished } from "@/lib/blog-store"
import { readLegalPages } from "@/lib/legal-store"
import { SEO_MANAGED_PAGES, type ChangeFreq } from "@/lib/seo-types"

export const dynamic = "force-dynamic"

function abs(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const trimmedBase = base.replace(/\/+$/, "")
  const trimmedPath = path.startsWith("/") ? path : `/${path}`
  return `${trimmedBase}${trimmedPath}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await readSeo()
  const base = seo.global.siteUrl || "https://webreta.com"
  const now = new Date()

  const entries: MetadataRoute.Sitemap = []

  for (const page of SEO_MANAGED_PAGES) {
    const cfg = seo.pages[page.href]
    if (!cfg || !cfg.includeInSitemap || cfg.noindex) continue
    entries.push({
      url: abs(base, page.href),
      lastModified: now,
      changeFrequency: cfg.changefreq as ChangeFreq,
      priority: cfg.priority,
    })
  }

  // Blog posts — every published post with sitemap opt-in (default true)
  try {
    const posts = await listPublished()
    for (const post of posts) {
      if (post.seo?.includeInSitemap === false) continue
      if (post.seo?.noindex) continue
      entries.push({
        url: abs(base, `/blog/${post.slug}`),
        lastModified: new Date(post.updatedAt || post.createdAt || now),
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  } catch {
    // Blog file missing — skip silently
  }

  // Optionally include legal pages
  if (seo.sitemap.includeLegalPages) {
    try {
      const legal = await readLegalPages()
      for (const lp of legal.pages) {
        entries.push({
          url: abs(base, `/yasal/${lp.slug}`),
          lastModified: new Date(lp.updatedAt || now),
          changeFrequency: "yearly",
          priority: 0.2,
        })
      }
    } catch {
      // ignore
    }
  }

  // Manually added URLs from admin
  for (const extra of seo.sitemap.extraUrls) {
    entries.push({
      url: abs(base, extra),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  }

  return entries
}

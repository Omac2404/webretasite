import { NextResponse } from "next/server"
import { readFooter } from "@/lib/footer-store"
import { readLegalPages } from "@/lib/legal-store"
import { legalPageHref } from "@/lib/legal-types"
import { SITE_PAGES } from "@/lib/site-pages"

export const dynamic = "force-dynamic"

// Public endpoint consumed by SiteFooter. Joins the admin's saved
// config with the linked legal pages and the site-page master list so
// the client gets ready-to-render labels and hrefs in one round-trip.
export async function GET() {
  const [config, { pages }] = await Promise.all([
    readFooter(),
    readLegalPages(),
  ])
  const labelByHref = new Map(SITE_PAGES.map((p) => [p.href, p.label]))
  const nav = config.navHrefs
    .map((href) => ({
      href,
      label: labelByHref.get(href) ?? href,
    }))
    .filter((item) => labelByHref.has(item.href))

  const pageById = new Map(pages.map((p) => [p.id, p]))
  const legalLinks = config.legalPageIds
    .map((id) => pageById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ id: p.id, title: p.title, href: legalPageHref(p.slug) }))

  return NextResponse.json(
    { config, nav, legalLinks },
    { headers: { "Cache-Control": "no-store" } },
  )
}

// Server-only footer aggregator. Resolves the footer config, the nav +
// legal links (joined against the site-page master list and legal pages) and
// the Google Partner badge in one place so both the SiteFooterServer wrapper
// and the homepage (which renders the footer inside a client tree) can seed
// the footer from the same shape. Mirrors the /api/footer join.
//
// Server-only: imports stores that touch node:fs.

import { readFooter } from "./footer-store"
import { readLegalPages } from "./legal-store"
import { legalPageHref } from "./legal-types"
import { SITE_PAGES } from "./site-pages"
import { readLogos } from "./logos-store"
import type { FooterConfig } from "./footer-types"

export type FooterData = {
  config: FooterConfig
  nav: { href: string; label: string }[]
  legalLinks: { id: string; title: string; href: string }[]
  googlePartner: { enabled: boolean; url: string }
}

export async function readFooterData(): Promise<FooterData> {
  const [config, { pages }, logos] = await Promise.all([
    readFooter(),
    readLegalPages(),
    readLogos(),
  ])

  const labelByHref = new Map(SITE_PAGES.map((p) => [p.href, p.label]))
  const nav = config.navHrefs
    .map((href) => ({ href, label: labelByHref.get(href) ?? href }))
    .filter((item) => labelByHref.has(item.href))

  const pageById = new Map(pages.map((p) => [p.id, p]))
  const legalLinks = config.legalPageIds
    .map((id) => pageById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ id: p.id, title: p.title, href: legalPageHref(p.slug) }))

  return { config, nav, legalLinks, googlePartner: logos.googlePartner }
}

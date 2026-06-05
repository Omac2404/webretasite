// Server-only helper to build a Next.js Metadata object for a public
// page by combining the global SEO defaults with the per-page overrides
// stored in seo.json. Pages call this from generateMetadata().

import type { Metadata } from "next"
import { readSeo } from "./seo-store"

function abs(base: string, p: string): string | undefined {
  if (!p) return undefined
  if (/^https?:\/\//i.test(p)) return p
  const trimmedBase = base.replace(/\/+$/, "")
  const trimmedPath = p.startsWith("/") ? p : `/${p}`
  return `${trimmedBase}${trimmedPath}`
}

export async function buildPageMetadata(href: string): Promise<Metadata> {
  const seo = await readSeo()
  const page = seo.pages[href]
  const global = seo.global
  const title = page?.title?.trim() || global.defaultTitle
  const description =
    page?.description?.trim() || global.defaultDescription
  const keywordsArr =
    page?.keywords && page.keywords.length > 0
      ? page.keywords
      : global.defaultKeywords
  const ogImage = page?.ogImage?.trim() || global.defaultOgImage

  const ogImageAbs = ogImage ? abs(global.siteUrl, ogImage) : undefined
  const canonical = global.siteUrl ? abs(global.siteUrl, href) : undefined

  const meta: Metadata = {
    title,
    description,
    ...(keywordsArr.length > 0 ? { keywords: keywordsArr } : {}),
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      siteName: global.siteName,
      title,
      description,
      url: canonical,
      ...(ogImageAbs ? { images: [{ url: ogImageAbs }] } : {}),
    },
    twitter: {
      card: ogImageAbs ? "summary_large_image" : "summary",
      title,
      description,
      ...(global.twitterHandle ? { site: global.twitterHandle } : {}),
      ...(ogImageAbs ? { images: [ogImageAbs] } : {}),
    },
    robots: page?.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }

  return meta
}

// metadataBase is needed once at the root layout level so Next.js can
// resolve relative URLs in nested metadata. Pulled from the global SEO
// store so admin owns the canonical site URL.
export async function getMetadataBase(): Promise<URL | undefined> {
  const seo = await readSeo()
  try {
    return new URL(seo.global.siteUrl || "https://webreta.com.tr")
  } catch {
    return undefined
  }
}

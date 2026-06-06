import HomePageClient from "@/components/HomePageClient"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { readSiteSettings } from "@/lib/site-settings-store"
import { DEFAULT_LOGO_URL } from "@/lib/site-settings-types"
import { readHero } from "@/lib/hero-store"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return buildPageMetadata("/")
}

export default async function HomePage() {
  // Hero copy is read server-side and passed in so the subheadline renders
  // correct on first paint — avoids the brief default-then-real swap (and
  // the layout jump it caused) under the typing words.
  const [settings, hero] = await Promise.all([readSiteSettings(), readHero()])
  return (
    <HomePageClient
      logoUrl={settings.logoUrl || DEFAULT_LOGO_URL}
      hero={hero}
    />
  )
}

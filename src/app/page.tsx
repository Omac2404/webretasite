import HomePageClient from "@/components/HomePageClient"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { readSiteSettings } from "@/lib/site-settings-store"
import { DEFAULT_LOGO_URL } from "@/lib/site-settings-types"
import { readHero } from "@/lib/hero-store"
import { readHomeData } from "@/lib/home-data"
import { readFooterData } from "@/lib/footer-data"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return buildPageMetadata("/")
}

export default async function HomePage() {
  // Every admin-managed section is read server-side and passed in so the
  // first paint already shows the real content — no default→real swap or the
  // layout jump (CLS) it caused after an admin edited copy.
  const [settings, hero, home, footer] = await Promise.all([
    readSiteSettings(),
    readHero(),
    readHomeData(),
    readFooterData(),
  ])
  return (
    <HomePageClient
      logoUrl={settings.logoUrl || DEFAULT_LOGO_URL}
      hero={hero}
      logos={home.logos}
      services={home.services}
      projects={home.projects}
      sidebar={home.sidebar}
      reviews={home.reviews}
      footer={footer}
    />
  )
}

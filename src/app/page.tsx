import HomePageClient from "@/components/HomePageClient"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { readSiteSettings } from "@/lib/site-settings-store"
import { DEFAULT_LOGO_URL } from "@/lib/site-settings-types"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return buildPageMetadata("/")
}

export default async function HomePage() {
  const settings = await readSiteSettings()
  return <HomePageClient logoUrl={settings.logoUrl || DEFAULT_LOGO_URL} />
}

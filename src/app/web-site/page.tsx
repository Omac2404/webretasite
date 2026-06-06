import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooter"
import QuoteWizardSection from "@/components/QuoteWizardSection"
import WebSiteExtras from "@/components/WebSiteExtras"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { readWebPackages } from "@/lib/web-packages-store"

export async function generateMetadata() {
  return buildPageMetadata("/web-site")
}

export const dynamic = "force-dynamic"

export default async function WebSitePage() {
  // Wizard heading + packages read server-side so the "Size Özel Fiyat
  // Teklifi" heading renders on first paint — avoids the empty→real swap
  // that pushed the wizard card down (the jump).
  const { wizardHeading, packages } = await readWebPackages()
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafafa]">
      <SiteHeader />
      <main>
        <QuoteWizardSection
          initialWizardHeading={wizardHeading}
          initialPackages={packages}
        />
        <WebSiteExtras />
      </main>
      <SiteFooter />
    </div>
  )
}

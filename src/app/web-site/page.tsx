import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooterServer"
import QuoteWizardSection from "@/components/QuoteWizardSection"
import WebSiteExtras from "@/components/WebSiteExtras"
import LandingContent from "@/components/LandingContent"
import { buildPageMetadata } from "@/lib/seo-metadata"
import { readWebPackages } from "@/lib/web-packages-store"
import { readLandingContent } from "@/lib/landing-content-store"

export async function generateMetadata() {
  return buildPageMetadata("/web-site")
}

export const dynamic = "force-dynamic"

export default async function WebSitePage() {
  // Wizard heading + packages read server-side so the "Size Özel Fiyat
  // Teklifi" heading renders on first paint — avoids the empty→real swap
  // that pushed the wizard card down (the jump).
  const [{ wizardHeading, packages, kobiBanner, kobiPopup }, landing] =
    await Promise.all([readWebPackages(), readLandingContent()])
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafafa]">
      <SiteHeader />
      <main>
        <QuoteWizardSection
          initialWizardHeading={wizardHeading}
          initialPackages={packages}
          initialKobiPopup={kobiPopup}
        />
        <WebSiteExtras banner={kobiBanner} />
        <LandingContent content={landing["web-site"]} />
      </main>
      <SiteFooter />
    </div>
  )
}

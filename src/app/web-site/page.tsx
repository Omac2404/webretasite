import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooter"
import QuoteWizardSection from "@/components/QuoteWizardSection"
import WebSiteExtras from "@/components/WebSiteExtras"
import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/web-site")
}

export default function WebSitePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafafa]">
      <SiteHeader />
      <main>
        <QuoteWizardSection />
        <WebSiteExtras />
      </main>
      <SiteFooter />
    </div>
  )
}

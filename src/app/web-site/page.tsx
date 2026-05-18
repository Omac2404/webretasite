import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import QuoteWizardSection from "@/components/QuoteWizardSection"

export const metadata = {
  title: "Web Site | Webreta",
}

export default function WebSitePage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main>
        <QuoteWizardSection />
      </main>
      <SiteFooter />
    </div>
  )
}

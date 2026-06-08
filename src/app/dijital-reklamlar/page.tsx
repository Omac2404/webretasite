import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooter"
import DijitalReklamlarClient from "@/components/DijitalReklamlarClient"
import { readPackages } from "@/lib/packages-store"
import { readLogos } from "@/lib/logos-store"
import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/dijital-reklamlar")
}

// Disable static caching so admin edits to packages.json show up on the
// next request without a rebuild.
export const dynamic = "force-dynamic"

export default async function DijitalReklamlarPage() {
  const [{ channels, whatsapp, globalCta }, { logos }] = await Promise.all([
    readPackages(),
    readLogos(),
  ])
  // Logos the admin marked as "reklam müşterisi" in the Referanslar tab.
  const adCustomers = logos
    .filter((l) => l.adCustomer)
    .map((l) => ({ name: l.name, imageUrl: l.imageUrl }))
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <DijitalReklamlarClient
        channels={channels}
        whatsapp={whatsapp}
        globalCta={globalCta}
        adCustomers={adCustomers}
      />
      <SiteFooter />
    </div>
  )
}

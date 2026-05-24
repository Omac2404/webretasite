import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import DijitalReklamlarClient from "@/components/DijitalReklamlarClient"
import { readPackages } from "@/lib/packages-store"
import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/dijital-reklamlar")
}

// Disable static caching so admin edits to packages.json show up on the
// next request without a rebuild.
export const dynamic = "force-dynamic"

export default async function DijitalReklamlarPage() {
  const { channels, whatsapp, globalCta } = await readPackages()
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <DijitalReklamlarClient
        channels={channels}
        whatsapp={whatsapp}
        globalCta={globalCta}
      />
      <SiteFooter />
    </div>
  )
}

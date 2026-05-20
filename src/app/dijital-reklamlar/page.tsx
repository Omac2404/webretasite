import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import DijitalReklamlarClient from "@/components/DijitalReklamlarClient"
import { readPackages } from "@/lib/packages-store"

export const metadata = {
  title: "Dijital Reklamlar | Webreta",
}

// Disable static caching so admin edits to packages.json show up on the
// next request without a rebuild.
export const dynamic = "force-dynamic"

export default async function DijitalReklamlarPage() {
  const { channels, whatsapp } = await readPackages()
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <DijitalReklamlarClient channels={channels} whatsapp={whatsapp} />
      <SiteFooter />
    </div>
  )
}

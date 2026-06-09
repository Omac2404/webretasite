import SiteHeaderServer from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooterServer"
import { buildPageMetadata } from "@/lib/seo-metadata"
import ReferanslarClient from "./referanslar-client"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return buildPageMetadata("/referanslar")
}

export default function ReferanslarPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafafa]">
      <SiteHeaderServer />
      <main>
        <ReferanslarClient />
      </main>
      <SiteFooter />
    </div>
  )
}

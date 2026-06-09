import { readFooterData } from "@/lib/footer-data"
import SiteFooter from "./SiteFooter"

// Server-side wrapper that resolves the footer config, nav + legal links and
// the Google Partner badge once, then forwards them to the client SiteFooter.
// Public pages render this instead of SiteFooter directly so the footer's
// real content is in the first paint — no default→real swap / layout jump.

export default async function SiteFooterServer() {
  const { config, nav, legalLinks, googlePartner } = await readFooterData()
  return (
    <SiteFooter
      config={config}
      nav={nav}
      legalLinks={legalLinks}
      googlePartner={googlePartner}
    />
  )
}

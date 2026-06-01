import { readSiteSettings } from "@/lib/site-settings-store"
import { DEFAULT_LOGO_URL } from "@/lib/site-settings-types"
import SiteHeader from "./SiteHeader"

// Server-side wrapper that resolves the admin-managed logo URL once and
// forwards to the client SiteHeader. Public pages render this instead
// of SiteHeader directly so the header reflects /admin/ayarlar changes.

export default async function SiteHeaderServer() {
  const settings = await readSiteSettings()
  return <SiteHeader logoUrl={settings.logoUrl || DEFAULT_LOGO_URL} />
}

import { readFooter } from "@/lib/footer-store"
import { readLegalPages } from "@/lib/legal-store"
import { SITE_PAGES } from "@/lib/site-pages"
import { FooterForm } from "./footer-form"

export const dynamic = "force-dynamic"

export default async function FooterAdminPage() {
  const [config, { pages: legalPages }] = await Promise.all([
    readFooter(),
    readLegalPages(),
  ])

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Footer
        </h1>
      </div>

      <FooterForm
        config={config}
        sitePages={SITE_PAGES}
        legalPages={legalPages}
      />
    </div>
  )
}

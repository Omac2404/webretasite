import { FileText, Info } from "lucide-react"
import { readLandingContent } from "@/lib/landing-content-store"
import { LANDING_PAGES } from "@/lib/landing-content-types"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { LandingForm } from "./landing-form"

export const dynamic = "force-dynamic"

export default async function LandingAdminPage() {
  const content = await readLandingContent()

  return (
    <div className="mx-auto flex max-w-[920px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Açılış İçeriği
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Web Site ve Dijital Reklamlar sayfalarında, footer&apos;dan önce
            görünen metin bölümleri ve SSS. Google Ads açılış sayfası
            deneyimini ve organik SEO&apos;yu güçlendirir.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#3c639f]/15 bg-[#3c639f]/[0.04] px-4 py-3 text-[12px] leading-relaxed text-[#1a3464]">
        <Info size={15} className="mt-0.5 shrink-0 text-[#3c639f]" />
        <p>
          Metin bölümlerinde <strong>boş satır = yeni paragraf</strong>. SSS
          eklediğinde sayfaya otomatik olarak FAQ schema&apos;sı da basılır —
          Google&apos;da &quot;sıkça sorulan sorular&quot; zengin sonucu olarak
          çıkma şansı doğar.
        </p>
      </div>

      {LANDING_PAGES.map((p) => (
        <section
          key={p.key}
          className="rounded-2xl border border-black/[0.06] bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[#3c639f]" />
              <div className="text-[13px] font-semibold text-[#0a0a0a]">
                {p.label} sayfası
              </div>
            </div>
            <PreviewLink href={p.path} />
          </div>
          <div className="mt-4">
            <LandingForm pageKey={p.key} initial={content[p.key]} />
          </div>
        </section>
      ))}
    </div>
  )
}

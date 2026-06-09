import { Globe, MessageSquare, Sparkles, Type } from "lucide-react"
import { readWebPackages } from "@/lib/web-packages-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { WebPackagesForm } from "./web-packages-form"
import { KobiBannerForm } from "./kobi-banner-form"
import { KobiPopupForm } from "./kobi-popup-form"
import { WizardHeadingForm } from "./wizard-heading-form"

export const dynamic = "force-dynamic"

export default async function WebPackagesAdminPage() {
  const { packages, kobiBanner, kobiPopup, wizardHeading } =
    await readWebPackages()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Web Site Paketleri
          </h1>
        </div>
        <PreviewLink href="/web-site" />
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Type size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Teklif aracı başlığı
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          /web-site sayfasındaki teklif sihirbazının üstündeki başlık ve
          alt metin.
        </p>
        <div className="mt-4">
          <WizardHeadingForm initial={wizardHeading} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Webreta KOBİ banner
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Teklif aracının altında görünen cross-sell şeridi. Arkaplan
          görseli, başlıklar, etiketler, maddeler ve CTA hepsi düzenlenebilir.
        </p>
        <div className="mt-4">
          <KobiBannerForm initial={kobiBanner} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Webreta KOBİ popup&apos;ı
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          &quot;Webreta KOBİ yönlendirmesi&quot; açık bir paket seçilince çıkan
          popup&apos;ın yazıları ve buton linki.
        </p>
        <div className="mt-4">
          <KobiPopupForm initial={kobiPopup} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Paketler ({packages.length})
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Sıralama buradaki sıraya göre. &quot;Webreta KOBİ yönlendirmesi&quot;
          açık olan paketler seçildiğinde KOBİ popup&apos;ı tetiklenir.
        </p>
        <div className="mt-4">
          <WebPackagesForm initial={packages} />
        </div>
      </section>
    </div>
  )
}

import { Cookie, RotateCcw } from "lucide-react"
import { readCookieConsent } from "@/lib/cookie-consent-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { CookieForm } from "./cookie-form"
import { resetCookieConsentAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function CookiesAdminPage() {
  const settings = await readCookieConsent()

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Çerez Yönetimi
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Sitedeki çerez bildirim pop-up&apos;ını yönet. Analitik çerezleri
            her durumda toplanır; bu bildirim ziyaretçiyi bilgilendirme amaçlıdır.
          </p>
        </div>
        <PreviewLink href="/" />
      </div>

      {/* Settings */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Cookie size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Bildirim ayarları
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Ziyaretçi &quot;{settings.buttonLabel || "Tamam"}&quot; butonuna
          bastığında bildirim gizlenir ve ayarladığın süre boyunca
          ({settings.reshowHours} saat) tekrar gösterilmez.
        </p>
        <div className="mt-4">
          <CookieForm initial={settings} />
        </div>
      </section>

      {/* Reset */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <RotateCcw size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Onayları sıfırla
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Bunu kullandığında, daha önce &quot;Tamam&quot; demiş olsalar bile
          <strong className="font-medium text-black/70"> tüm ziyaretçilere</strong>{" "}
          bildirim yeniden gösterilir. Bildirim ayrıca her ziyaretçi için
          {" "}
          {settings.reshowHours} saatte bir otomatik olarak tekrar çıkar.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <form action={resetCookieConsentAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-white px-4 py-2 text-[12.5px] font-medium text-black/70 transition-colors hover:border-[#3c639f]/40 hover:text-[#3c639f]"
            >
              <RotateCcw size={14} />
              Tüm ziyaretçilere yeniden göster
            </button>
          </form>
          <span className="text-[11.5px] text-black/40">
            Geçerli sürüm: v{settings.version}
          </span>
        </div>
      </section>
    </div>
  )
}

import { Code2, Info } from "lucide-react"
import { readSiteCode } from "@/lib/site-code-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { CodeForm } from "./code-form"

export const dynamic = "force-dynamic"

export default async function SiteCodeAdminPage() {
  const settings = await readSiteCode()

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Kod Ekleme
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Sitenin <code className="rounded bg-black/[0.05] px-1">&lt;head&gt;</code>{" "}
            ve <code className="rounded bg-black/[0.05] px-1">&lt;body&gt;</code>{" "}
            kısımlarına üçüncü parti kod ekle: Search Console doğrulaması,
            Google Ads/Analytics, Meta Pixel veya farklı API scriptleri.
          </p>
        </div>
        <PreviewLink href="/" />
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Özel kodlar
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Kodu olduğu gibi (etiketleriyle birlikte) yapıştır. Kayıt sonrası
          tüm ziyaretçi sayfalarında çalışır; admin panelinde çalışmaz.
        </p>
        <div className="mt-4">
          <CodeForm initial={settings} />
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 text-[12px] leading-relaxed text-amber-900/80">
        <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <p>
          Buraya eklenen kod sitende doğrudan çalışır — yalnızca güvendiğin
          kaynaklardan (Google, Meta vb.) gelen kodları yapıştır. Hatalı kod
          sayfaların görünümünü veya performansını etkileyebilir. Kodu geçici
          olarak durdurmak istersen ilgili alanın üstündeki onay kutusunu
          kapatman yeterli — kod silinmez.
        </p>
      </div>
    </div>
  )
}

import { readTemplates } from "@/lib/email-templates-store"
import { readFormSuccess } from "@/lib/form-success-store"
import { TemplatesForm } from "./templates-form"
import { SuccessScreensForm } from "./success-screens-form"

export const dynamic = "force-dynamic"

export default async function EmailTemplatesAdminPage() {
  const [templates, successScreens] = await Promise.all([
    readTemplates(),
    readFormSuccess(),
  ])

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            E-posta Şablonları
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/55">
            Sitedeki 3 form için toplam 6 şablon. Her form, gönderildiğinde iki
            mail tetikler: biri ziyaretçiye (onay), biri size (bildirim). Süslü
            parantez içindeki{" "}
            <code className="rounded bg-black/[0.04] px-1 font-mono text-[11px]">
              {`{name}`}
            </code>{" "}
            gibi anahtarlar form verisiyle değiştirilir.
          </p>
        </div>

        <TemplatesForm templates={templates} />
      </section>

      <section className="flex flex-col gap-5 border-t border-black/[0.08] pt-8">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Form gönderim sonrası ekranları
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-black/55">
            Her form gönderildikten sonra ziyaretçiye gösterilen
            &ldquo;teşekkürler&rdquo; ekranı. Başlığı, gövdeyi ve aksiyon butonunu buradan
            değiştirebilirsin. Gövdede iki boş satır yeni paragraf açar; süslü
            parantezli anahtarlar form verisiyle değiştirilir.
          </p>
        </div>

        <SuccessScreensForm screens={successScreens} />
      </section>
    </div>
  )
}

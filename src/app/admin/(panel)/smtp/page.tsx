import Link from "next/link"
import { ExternalLink, CheckCircle2, Circle } from "lucide-react"
import { readSmtpForAdmin } from "@/lib/smtp-store"
import { readTemplates } from "@/lib/email-templates-store"
import { SITE_FORMS } from "@/lib/site-forms"
import { SmtpForm } from "./smtp-form"
import { TemplatesForm } from "./templates-form"

export const dynamic = "force-dynamic"

export default async function SmtpAdminPage() {
  const [settings, templates] = await Promise.all([
    readSmtpForAdmin(),
    readTemplates(),
  ])

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          SMTP & Formlar
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Site formlarının kullanacağı SMTP sunucusunu buradan yapılandır.
          Aşağıda sitede aktif olan tüm formların listesi var.
        </p>
      </div>

      <SmtpForm settings={settings} />

      {/* Form list */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div>
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Sitedeki formlar
          </div>
          <p className="mt-1 text-[12px] text-black/50">
            Toplam {SITE_FORMS.length} form. SMTP gönderim aktifken aşağıdaki
            formlar mail tetikleyebilir.
          </p>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {SITE_FORMS.map((f) => (
            <li
              key={f.id}
              className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4"
            >
              <div className="mt-0.5 shrink-0">
                {f.emailWired ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <Circle size={16} className="text-black/25" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-[#0a0a0a]">
                    {f.label}
                  </span>
                  <span
                    className={
                      f.emailWired
                        ? "rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                        : "rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                    }
                  >
                    {f.emailWired ? "Mail bağlı" : "Mail bağlanmadı"}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-black/55">
                  {f.location}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-black/45">
                  <span className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono">
                    {f.handler}
                  </span>
                </div>
              </div>
              <Link
                href={f.href}
                target="_blank"
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#3c639f] transition-colors hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.04]"
              >
                Görüntüle
                <ExternalLink size={11} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Email templates */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div>
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            E-posta şablonları
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-black/50">
            Form gönderildiğinde çıkacak maillerin konu ve gövdesi. Süslü
            parantez içindeki <code className="rounded bg-black/[0.04] px-1 font-mono text-[11px]">{`{name}`}</code> gibi anahtarlar
            forma giren verilerle değiştirilir.
          </p>
        </div>
        <div className="mt-4">
          <TemplatesForm templates={templates} />
        </div>
      </section>
    </div>
  )
}

import Link from "next/link"
import { MailPlus } from "lucide-react"
import { readSmtpForAdmin } from "@/lib/smtp-store"
import { readLegalPages } from "@/lib/legal-store"
import { readFormLegal } from "@/lib/form-legal-store"
import { SITE_FORMS } from "@/lib/site-forms"
import { SmtpForm } from "./smtp-form"
import { FormsLegalPicker } from "./forms-legal-picker"

export const dynamic = "force-dynamic"

export default async function SmtpAdminPage() {
  const [settings, { pages: legalPages }, formLegal] = await Promise.all([
    readSmtpForAdmin(),
    readLegalPages(),
    readFormLegal(),
  ])

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          SMTP & Formlar
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Site formlarının kullanacağı SMTP sunucusunu buradan yapılandır.
          Aşağıda sitede aktif olan tüm formların listesi var. Mail içerikleri
          için{" "}
          <Link
            href="/admin/e-posta-sablonlari"
            className="inline-flex items-center gap-1 text-[#3c639f] underline-offset-2 hover:underline"
          >
            <MailPlus size={12} />
            E-posta Şablonları
          </Link>{" "}
          sekmesine bakın.
        </p>
      </div>

      <SmtpForm settings={settings} />

      <FormsLegalPicker
        siteForms={SITE_FORMS}
        legalPages={legalPages}
        initial={formLegal}
      />
    </div>
  )
}

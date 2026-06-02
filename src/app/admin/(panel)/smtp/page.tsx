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

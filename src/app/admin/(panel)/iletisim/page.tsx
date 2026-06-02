import { readContact } from "@/lib/contact-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { ContactAdminForm } from "./contact-form"

export const dynamic = "force-dynamic"

export default async function ContactAdminPage() {
  const content = await readContact()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            İletişim Sayfası
          </h1>
        </div>
        <PreviewLink href="/iletisim" />
      </div>

      <ContactAdminForm content={content} />
    </div>
  )
}

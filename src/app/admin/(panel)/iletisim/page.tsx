import { readContact } from "@/lib/contact-store"
import { ContactAdminForm } from "./contact-form"

export const dynamic = "force-dynamic"

export default async function ContactAdminPage() {
  const content = await readContact()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          İletişim Sayfası
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          /iletisim sayfasındaki tüm alanları buradan düzenle — başlıklar,
          bilgi kartları ve harita.
        </p>
      </div>

      <ContactAdminForm content={content} />
    </div>
  )
}

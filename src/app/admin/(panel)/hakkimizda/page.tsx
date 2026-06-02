import { readAbout } from "@/lib/about-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { AboutForm } from "./about-form"

export const dynamic = "force-dynamic"

export default async function HakkimizdaAdminPage() {
  const about = await readAbout()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Hakkımızda Sayfası
          </h1>
        </div>
        <PreviewLink href="/hakkimizda" />
      </div>

      <AboutForm about={about} />
    </div>
  )
}

import { readAbout } from "@/lib/about-store"
import { AboutForm } from "./about-form"

export const dynamic = "force-dynamic"

export default async function HakkimizdaAdminPage() {
  const about = await readAbout()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Hakkımızda Sayfası
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-black/55">
          Hakkımızda sayfasındaki hero, iki alternatif blok ve sayfa altındaki
          CTA buradan düzenlenir. Görseller yüklenmediyse yerine marka
          gradient placeholder gösterilir.
        </p>
      </div>

      <AboutForm about={about} />
    </div>
  )
}

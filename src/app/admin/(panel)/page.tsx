import { LayoutDashboard } from "lucide-react"
import { readHero } from "@/lib/hero-store"
import { HeroForm } from "./hero-form"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const hero = await readHero()

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Anasayfa Hero
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Anasayfanın üst bölümündeki başlık altı yazısını ve iki CTA butonunu
          (yazısı ve linki) buradan düzenle. Her iki buton da aynı mavi stilde
          render edilir.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Başlık altı + CTA butonları
          </div>
        </div>
        <div className="mt-4">
          <HeroForm initial={hero} />
        </div>
      </section>
    </div>
  )
}

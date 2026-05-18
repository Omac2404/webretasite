import { readServices } from "@/lib/services-store"
import { ServicesForm } from "./services-form"

export const dynamic = "force-dynamic"

export default async function HizmetlerAdminPage() {
  const { cards } = await readServices()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Hizmetler
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Anasayfadaki <em>Neler yaparız?</em> bölümünde yan yana duran iki
          kartın başlığını ve alt maddelerini buradan düzenle. Kart başına
          en fazla 5 alt madde girebilirsin.
        </p>
      </div>

      <ServicesForm cards={cards} />
    </div>
  )
}

import { readFloatMenu } from "@/lib/float-menu-store"
import { FloatMenuAdminForm } from "./float-menu-form"

export const dynamic = "force-dynamic"

export default async function FloatMenuAdminPage() {
  const config = await readFloatMenu()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Mobil Yüzen Menü
        </h1>
      </div>

      <FloatMenuAdminForm config={config} />
    </div>
  )
}

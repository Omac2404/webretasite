import { Sparkles } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center pt-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3c639f]/[0.08]">
        <Sparkles size={26} className="text-[#3c639f]" strokeWidth={1.75} />
      </div>
      <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
        Hoş geldin
      </h1>
      <p className="mt-3 max-w-[460px] text-[14.5px] leading-relaxed text-black/55">
        Panel şimdilik boş. Hangi alanları buradan yönetmek istediğini söyle —
        yorumlar, paketler, teklifler ya da başka ne olursa — sırayla
        ekleyelim.
      </p>
    </div>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { Wrench } from "lucide-react"

// Thin top banner shown when admin toggles maintenance mode in Ayarlar.
// Hidden on /admin/* so the operator can still drive the panel.
// Settings are fetched server-side and passed in so we don't ship a JSON
// roundtrip per page load.

export default function MaintenanceBanner({
  enabled,
  message,
}: {
  enabled: boolean
  message: string
}) {
  const pathname = usePathname()
  if (!enabled) return null
  if (pathname?.startsWith("/admin")) return null

  const text = message.trim() || "Site bakım modunda. Kısa süre içinde geri döneceğiz."

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-amber-400/95 px-4 py-2 text-[12.5px] font-medium text-amber-950 shadow-sm backdrop-blur-sm">
      <Wrench size={13} className="shrink-0" aria-hidden />
      <span className="line-clamp-2 text-center">{text}</span>
    </div>
  )
}

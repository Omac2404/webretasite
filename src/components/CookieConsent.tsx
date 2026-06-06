"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Cookie } from "lucide-react"
import type { CookieConsentSettings } from "@/lib/cookie-consent-types"

// Informational cookie notice. Tracking runs unconditionally — accepting
// here just records acknowledgement locally so the notice can stay hidden
// until it should reappear:
//   • the admin "resets" consent (server `version` bumps), or
//   • `reshowHours` have passed since the visitor accepted.
// Settings are read server-side and passed in to avoid a JSON roundtrip.

const STORAGE_KEY = "webreta-cookie-consent"

type Stored = { v: number; at: number }

export default function CookieConsent({
  settings,
}: {
  settings: CookieConsentSettings
}) {
  const pathname = usePathname()
  // Start hidden; an effect decides whether to show it so SSR and the
  // first client paint agree (no hydration mismatch).
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!settings.enabled) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setVisible(true)
        return
      }
      const parsed = JSON.parse(raw) as Partial<Stored>
      const reshowMs = settings.reshowHours * 60 * 60 * 1000
      const expired =
        typeof parsed.at !== "number" || Date.now() - parsed.at > reshowMs
      const staleVersion = parsed.v !== settings.version
      if (expired || staleVersion) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [settings.enabled, settings.reshowHours, settings.version])

  if (pathname?.startsWith("/admin")) return null
  if (!settings.enabled || !visible) return null

  function accept() {
    try {
      const stored: Stored = { v: settings.version, at: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Private mode / storage disabled — just dismiss for this session.
    }
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:px-6">
      <div className="flex w-full max-w-[640px] flex-col gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3c639f]/[0.10] text-[#3c639f]">
          <Cookie size={20} />
        </div>

        <div className="min-w-0 flex-1">
          {settings.title && (
            <div className="text-[13.5px] font-semibold text-[#0a0a0a]">
              {settings.title}
            </div>
          )}
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-black/60">
            {settings.message}
            {settings.policyUrl && (
              <>
                {" "}
                <a
                  href={settings.policyUrl}
                  className="font-medium text-[#3c639f] underline underline-offset-2 hover:text-[#2f5288]"
                >
                  {settings.policyLabel || "Çerez Politikası"}
                </a>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288]"
        >
          {settings.buttonLabel || "Tamam"}
        </button>
      </div>
    </div>
  )
}

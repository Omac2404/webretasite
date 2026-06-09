"use client"

import { useEffect } from "react"
import type { AdsConversionsSettings } from "@/lib/ads-conversions-types"
import { TRACK_EVENT_NAME, type TrackEventDetail } from "@/lib/track-client"

// Bridges the site's existing interaction signals to Google Ads conversion
// events. It does NOT load the gtag/Ads tag — that's pasted via
// /admin/kod-ekleme. This only fires gtag('event','conversion', {send_to})
// on top of it, reusing the very same signals the internal analytics already
// captures:
//   • form submissions  → trackFormSubmit() dispatches a "webreta:track-event"
//     CustomEvent with target "form-submit:<id>"
//   • WhatsApp / phone   → data-track links, caught via a capture-phase click
//     listener (fires before the link navigates)
// Each conversion action fires at most once per page load, and never inside
// the /admin panel.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

type ConversionKind = "form" | "whatsapp" | "phone"

export default function AdsConversions({
  settings,
}: {
  settings: AdsConversionsSettings
}) {
  useEffect(() => {
    if (!settings.enabled) return
    const sendToFor: Record<ConversionKind, string> = {
      form: settings.formSendTo,
      whatsapp: settings.whatsappSendTo,
      phone: settings.phoneSendTo,
    }
    if (!sendToFor.form && !sendToFor.whatsapp && !sendToFor.phone) return

    // One fire per action per page load — avoids inflating numbers if a
    // visitor clicks the same WhatsApp/phone button twice.
    const fired = new Set<ConversionKind>()

    function fire(kind: ConversionKind) {
      const sendTo = sendToFor[kind]
      if (!sendTo || fired.has(kind)) return
      // Never report conversions from inside the admin panel.
      if (window.location.pathname.startsWith("/admin")) return
      if (typeof window.gtag !== "function") return
      fired.add(kind)
      window.gtag("event", "conversion", { send_to: sendTo })
    }

    function classify(target: string): ConversionKind | null {
      if (target.startsWith("form-submit:")) return "form"
      if (target.includes("whatsapp")) return "whatsapp"
      if (target.includes("phone")) return "phone"
      return null
    }

    function handleTarget(target: string) {
      const kind = classify(target)
      if (kind) fire(kind)
    }

    // Form submissions (programmatic).
    function onCustomEvent(e: Event) {
      const detail = (e as CustomEvent<TrackEventDetail>).detail
      if (detail && typeof detail.target === "string") {
        handleTarget(detail.target)
      }
    }
    window.addEventListener(TRACK_EVENT_NAME, onCustomEvent)

    // WhatsApp / phone data-track links (capture phase, before navigation).
    function onDocClick(e: MouseEvent) {
      const el =
        e.target instanceof Element
          ? e.target.closest<HTMLElement>("[data-track]")
          : null
      const target = el?.dataset.track
      if (target) handleTarget(target)
    }
    document.addEventListener("click", onDocClick, true)

    return () => {
      window.removeEventListener(TRACK_EVENT_NAME, onCustomEvent)
      document.removeEventListener("click", onDocClick, true)
    }
  }, [settings])

  return null
}

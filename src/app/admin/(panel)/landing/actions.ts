"use server"

import { revalidatePath } from "next/cache"
import { recordAudit } from "@/lib/audit-log-store"
import { updateLandingPage } from "@/lib/landing-content-store"
import {
  LANDING_PAGES,
  type LandingPageContent,
  type LandingPageKey,
} from "@/lib/landing-content-types"

export type SaveState = { ok?: boolean; error?: string }

const VALID_KEYS = new Set(LANDING_PAGES.map((p) => p.key))

// The client form serializes the whole page content (enabled + sections +
// faqTitle + faqs) into a single JSON "payload" field. The store normalizes
// it, so loosely-shaped input is fine — we just validate the page key.
export async function saveLandingPageAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const key = String(formData.get("page") ?? "")
  if (!VALID_KEYS.has(key as LandingPageKey)) {
    return { error: "Geçersiz sayfa." }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(String(formData.get("payload") ?? "{}"))
  } catch {
    return { error: "İçerik okunamadı, tekrar dene." }
  }
  await updateLandingPage(key as LandingPageKey, parsed as LandingPageContent)
  await recordAudit("settings.landing.save", { note: key })
  revalidatePath("/admin/landing")
  revalidatePath(`/${key}`)
  return { ok: true }
}

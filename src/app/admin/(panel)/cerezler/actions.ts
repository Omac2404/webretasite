"use server"

import { revalidatePath } from "next/cache"
import { recordAudit } from "@/lib/audit-log-store"
import {
  writeCookieConsent,
  bumpCookieConsentVersion,
} from "@/lib/cookie-consent-store"

export type SaveState = { ok?: boolean; error?: string }

function revalidate(): void {
  revalidatePath("/admin/cerezler")
  // The banner lives in the root layout, so refresh every public page.
  revalidatePath("/", "layout")
}

export async function saveCookieConsentAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const enabled = formData.get("enabled") === "on"
  const title = String(formData.get("title") ?? "").trim().slice(0, 120)
  const message = String(formData.get("message") ?? "").trim().slice(0, 600)
  const buttonLabel = String(formData.get("buttonLabel") ?? "")
    .trim()
    .slice(0, 40)
  const policyUrl = String(formData.get("policyUrl") ?? "").trim().slice(0, 300)
  const policyLabel = String(formData.get("policyLabel") ?? "")
    .trim()
    .slice(0, 60)
  const reshowHoursRaw = Number(formData.get("reshowHours"))

  if (!message) return { error: "Çerez metni boş olamaz." }

  await writeCookieConsent({
    enabled,
    title,
    message,
    buttonLabel,
    policyUrl,
    policyLabel,
    reshowHours: Number.isFinite(reshowHoursRaw) ? reshowHoursRaw : 24,
  })
  await recordAudit("settings.cookie.save", {
    note: enabled ? "aktif" : "pasif",
  })
  revalidate()
  return { ok: true }
}

// Bumps the consent version so the notice reappears for every visitor.
export async function resetCookieConsentAction(): Promise<void> {
  const version = await bumpCookieConsentVersion()
  await recordAudit("settings.cookie.reset", { note: `versiyon ${version}` })
  revalidate()
}

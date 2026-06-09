"use server"

import { revalidatePath } from "next/cache"
import { recordAudit } from "@/lib/audit-log-store"
import { writeSiteCode } from "@/lib/site-code-store"
import { writeAdsConversions } from "@/lib/ads-conversions-store"

export type SaveState = { ok?: boolean; error?: string }

// Generous cap so a full gtag + Ads + Pixel block fits, while still
// bounding what gets injected into every page.
const MAX_LEN = 20_000

export async function saveSiteCodeAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const headEnabled = formData.get("headEnabled") === "on"
  const bodyEnabled = formData.get("bodyEnabled") === "on"
  const headCode = String(formData.get("headCode") ?? "")
  const bodyCode = String(formData.get("bodyCode") ?? "")

  if (headCode.length > MAX_LEN || bodyCode.length > MAX_LEN) {
    return { error: `Kod çok uzun (en fazla ${MAX_LEN} karakter).` }
  }

  await writeSiteCode({ headEnabled, headCode, bodyEnabled, bodyCode })
  await recordAudit("settings.code.save", {
    note: `head ${headEnabled ? "aktif" : "pasif"} · body ${
      bodyEnabled ? "aktif" : "pasif"
    }`,
  })

  revalidatePath("/admin/kod-ekleme")
  // Injector lives in the root layout, so refresh every public page.
  revalidatePath("/", "layout")
  return { ok: true }
}

// Basic sanity for a Google Ads "send_to": "AW-XXXX/Label". Empty is allowed
// (that action just won't be reported). We don't hard-fail on format so a
// slightly different Google value still saves, but we strip whitespace.
const MAX_SEND_TO = 200

export async function saveAdsConversionsAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const enabled = formData.get("enabled") === "on"
  const formSendTo = String(formData.get("formSendTo") ?? "").trim()
  const whatsappSendTo = String(formData.get("whatsappSendTo") ?? "").trim()
  const phoneSendTo = String(formData.get("phoneSendTo") ?? "").trim()

  for (const v of [formSendTo, whatsappSendTo, phoneSendTo]) {
    if (v.length > MAX_SEND_TO) {
      return { error: "Dönüşüm etiketi çok uzun — Google'dan kopyaladığın değeri yapıştır." }
    }
  }

  await writeAdsConversions({ enabled, formSendTo, whatsappSendTo, phoneSendTo })
  await recordAudit("settings.ads-conversions.save", {
    note: `dönüşüm ${enabled ? "aktif" : "pasif"}`,
  })

  revalidatePath("/admin/kod-ekleme")
  revalidatePath("/", "layout")
  return { ok: true }
}

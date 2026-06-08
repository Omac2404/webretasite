"use server"

import { revalidatePath } from "next/cache"
import { recordAudit } from "@/lib/audit-log-store"
import { writeSiteCode } from "@/lib/site-code-store"

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

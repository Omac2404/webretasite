"use server"

import { revalidatePath } from "next/cache"
import {
  addLogo,
  deleteLogo,
  moveLogo,
  setDisplayMode,
  setGooglePartner,
  swapLogoRow,
  type LogoDisplayMode,
  type LogoRow,
} from "@/lib/logos-store"

export type AddLogoState = { error?: string; ok?: boolean }

function parseRow(value: FormDataEntryValue | null): LogoRow {
  return String(value ?? "") === "b" ? "b" : "a"
}

function revalidateBoth(): void {
  revalidatePath("/admin/referanslar")
  revalidatePath("/")
}

export async function addLogoAction(
  _prev: AddLogoState,
  formData: FormData,
): Promise<AddLogoState> {
  const name = String(formData.get("name") ?? "").trim()
  // The image now comes from the media library (picker writes the public
  // URL into a hidden `imageUrl` field), so logos reuse the central library
  // instead of a separate /public/logos upload path.
  const imageUrl = String(formData.get("imageUrl") ?? "").trim()
  const row = parseRow(formData.get("row"))

  if (!name) return { error: "Firma ismi gerekli." }
  if (!imageUrl) return { error: "Logo görseli gerekli." }

  await addLogo({ name, imageUrl, row })

  revalidateBoth()
  return { ok: true }
}

export async function deleteLogoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteLogo(id)
  revalidateBoth()
}

export async function setModeAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("mode") ?? "")
  const mode: LogoDisplayMode = raw === "logos" ? "logos" : "names"
  await setDisplayMode(mode)
  revalidateBoth()
}

export async function moveLogoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  const direction = String(formData.get("direction") ?? "") as "up" | "down"
  if (!id || (direction !== "up" && direction !== "down")) return
  await moveLogo(id, direction)
  revalidateBoth()
}

export async function swapRowAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await swapLogoRow(id)
  revalidateBoth()
}

// Google Partner badge — enabled flag and directory URL. Submit form
// fields: `enabled` ("on"/missing) and `url` (string). Empty url resets
// to the default directory URL via the store's normalizer.
export async function setGooglePartnerAction(formData: FormData): Promise<void> {
  const enabled = formData.get("enabled") === "on"
  const url = String(formData.get("url") ?? "").trim()
  await setGooglePartner({ enabled, url })
  revalidateBoth()
}

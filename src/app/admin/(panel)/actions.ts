"use server"

import { revalidatePath } from "next/cache"
import { readHero, writeHero, type HeroData } from "@/lib/hero-store"

export type SaveHeroState = { ok?: boolean; error?: string }

export async function saveHeroAction(
  _prev: SaveHeroState,
  formData: FormData,
): Promise<SaveHeroState> {
  const subheadline = String(formData.get("subheadline") ?? "").trim()
  const primaryLabel = String(formData.get("primaryLabel") ?? "").trim()
  const primaryHref = String(formData.get("primaryHref") ?? "").trim()
  const secondaryLabel = String(formData.get("secondaryLabel") ?? "").trim()
  const secondaryHref = String(formData.get("secondaryHref") ?? "").trim()

  if (!subheadline) return { error: "Başlık altı yazısı boş bırakılamaz." }
  if (!primaryLabel || !primaryHref) {
    return { error: "Birinci butonun başlığı ve linki gerekli." }
  }
  if (!secondaryLabel || !secondaryHref) {
    return { error: "İkinci butonun başlığı ve linki gerekli." }
  }

  const data: HeroData = {
    subheadline,
    primaryButton: { label: primaryLabel, href: primaryHref },
    secondaryButton: { label: secondaryLabel, href: secondaryHref },
  }

  await writeHero(data)
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true }
}

export async function _readHeroForAdmin(): Promise<HeroData> {
  return readHero()
}

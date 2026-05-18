"use server"

import { revalidatePath } from "next/cache"
import { setAllServiceCards } from "@/lib/services-store"
import {
  MAX_BULLETS_PER_CARD,
  SERVICE_KEYS,
  type ServiceKey,
} from "@/lib/services-types"

export type ServicesFormState = { error?: string; ok?: boolean }

// Pull a card's fields from the form. Field names follow the pattern
// `<key>__title` and `<key>__bullet_<index>` so both cards can live in
// one HTML form.
function readCard(formData: FormData, key: ServiceKey) {
  const title = String(formData.get(`${key}__title`) ?? "").trim()
  const bullets: string[] = []
  for (let i = 0; i < MAX_BULLETS_PER_CARD; i++) {
    const raw = String(formData.get(`${key}__bullet_${i}`) ?? "").trim()
    if (raw) bullets.push(raw)
  }
  return { key, title, bullets }
}

export async function saveServicesAction(
  _prev: ServicesFormState,
  formData: FormData,
): Promise<ServicesFormState> {
  const cards = SERVICE_KEYS.map((key) => readCard(formData, key))
  for (const c of cards) {
    if (!c.title) {
      return { error: `Kart başlığı boş bırakılamaz (${c.key}).` }
    }
    if (c.bullets.length === 0) {
      return { error: `En az bir alt madde girmelisin (${c.key}).` }
    }
  }
  await setAllServiceCards(cards)
  revalidatePath("/admin/hizmetler")
  revalidatePath("/")
  return { ok: true }
}

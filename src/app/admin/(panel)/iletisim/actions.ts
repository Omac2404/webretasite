"use server"

import { revalidatePath } from "next/cache"
import { writeContact } from "@/lib/contact-store"
import {
  extractGoogleMapsEmbedSrc,
  type ContactContent,
} from "@/lib/contact-types"

export type ContactFormState = { error?: string; ok?: boolean }

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

export async function saveContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const heroHighlight = s(formData, "hero_titleHighlight")
  const formHighlight = s(formData, "form_titleHighlight")
  const mapHighlight = s(formData, "map_titleHighlight")
  if (!heroHighlight) return { error: "Hero başlığının vurgu kısmı boş bırakılamaz." }
  if (!formHighlight) return { error: "Form başlığının vurgu kısmı boş bırakılamaz." }
  if (!mapHighlight) return { error: "Harita başlığının vurgu kısmı boş bırakılamaz." }

  const rawEmbed = s(formData, "map_embedSrc")
  let embedSrc = ""
  if (rawEmbed) {
    embedSrc = extractGoogleMapsEmbedSrc(rawEmbed)
    if (!embedSrc) {
      return {
        error:
          "Harita embed alanı geçersiz. Google Maps > Paylaş > Haritayı yerleştir bölümündeki iframe HTML'ini veya 'https://www.google.com/maps/embed?...' URL'ini yapıştırın.",
      }
    }
  }

  const content: ContactContent = {
    hero: {
      kicker: s(formData, "hero_kicker"),
      titleLeading: s(formData, "hero_titleLeading"),
      titleHighlight: heroHighlight,
      titleTrailing: s(formData, "hero_titleTrailing"),
      intro: s(formData, "hero_intro"),
    },
    info: {
      email: s(formData, "info_email"),
      phone: s(formData, "info_phone"),
      address: s(formData, "info_address"),
      hours: s(formData, "info_hours"),
    },
    form: {
      kicker: s(formData, "form_kicker"),
      titleLeading: s(formData, "form_titleLeading"),
      titleHighlight: formHighlight,
      titleTrailing: s(formData, "form_titleTrailing"),
      intro: s(formData, "form_intro"),
    },
    map: {
      kicker: s(formData, "map_kicker"),
      titleLeading: s(formData, "map_titleLeading"),
      titleHighlight: mapHighlight,
      titleTrailing: s(formData, "map_titleTrailing"),
      intro: s(formData, "map_intro"),
      embedSrc,
      shareUrl: s(formData, "map_shareUrl"),
    },
  }

  await writeContact(content)
  revalidatePath("/admin/iletisim")
  revalidatePath("/iletisim")
  return { ok: true }
}

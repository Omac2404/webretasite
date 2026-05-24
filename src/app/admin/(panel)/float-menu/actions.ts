"use server"

import { revalidatePath } from "next/cache"
import { writeFloatMenu } from "@/lib/float-menu-store"
import type { FloatMenuConfig } from "@/lib/float-menu-types"

export type FloatMenuFormState = { error?: string; ok?: boolean }

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function b(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true"
}

export async function saveFloatMenuAction(
  _prev: FloatMenuFormState,
  formData: FormData,
): Promise<FloatMenuFormState> {
  const config: FloatMenuConfig = {
    enabled: b(formData, "enabled"),
    webSite: {
      enabled: b(formData, "webSite_enabled"),
      label: s(formData, "webSite_label") || "Web Site",
      href: s(formData, "webSite_href") || "/web-site",
    },
    ads: {
      enabled: b(formData, "ads_enabled"),
      label: s(formData, "ads_label") || "Reklamlar",
      href: s(formData, "ads_href") || "/dijital-reklamlar",
    },
    contact: {
      enabled: b(formData, "contact_enabled"),
      label: s(formData, "contact_label") || "İletişim",
      phone: s(formData, "contact_phone"),
      whatsapp: s(formData, "contact_whatsapp"),
      whatsappMessage: s(formData, "contact_whatsappMessage"),
    },
  }

  if (config.contact.enabled && !config.contact.phone && !config.contact.whatsapp) {
    return {
      error:
        "İletişim butonu açıkken telefon veya WhatsApp numarasından en az birini girmelisin.",
    }
  }

  await writeFloatMenu(config)
  revalidatePath("/admin/float-menu")
  revalidatePath("/", "layout")
  return { ok: true }
}

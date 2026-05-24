// Mobil cihazlarda alt kısımda görünen yüzen menü ayarları. Client-safe tipler.

export type FloatMenuConfig = {
  enabled: boolean
  webSite: {
    enabled: boolean
    label: string
    href: string
  }
  ads: {
    enabled: boolean
    label: string
    href: string
  }
  contact: {
    enabled: boolean
    label: string
    phone: string
    whatsapp: string
    whatsappMessage: string
  }
}

export const DEFAULT_FLOAT_MENU: FloatMenuConfig = {
  enabled: true,
  webSite: {
    enabled: true,
    label: "Web Site",
    href: "/web-site",
  },
  ads: {
    enabled: true,
    label: "Reklamlar",
    href: "/dijital-reklamlar",
  },
  contact: {
    enabled: true,
    label: "İletişim",
    phone: "+90 542 580 94 92",
    whatsapp: "+90 542 580 94 92",
    whatsappMessage: "Merhaba, web siteniz üzerinden ulaşıyorum.",
  },
}

// Telefon numarasını tel: link'i için temizler. Boşluk, parantez, tire vs. atar.
export function toTelHref(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "")
  return cleaned ? `tel:${cleaned}` : ""
}

// WhatsApp wa.me linki üretir. +90... → 90... formatına çevirir, opsiyonel mesaj ekler.
export function toWhatsappHref(raw: string, message: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  const base = `https://wa.me/${digits}`
  const text = message.trim()
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

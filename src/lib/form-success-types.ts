// Form gönderildikten sonra gösterilen "teşekkürler" ekranları — admin
// panelden düzenlenebilir kopyalar. Mail şablonlarına paralel ama UI
// görünümlü (mail gövdesi değil, sayfa üzerinde gösterilen kart/popup).
//
// Gövde ve başlık alanlarında {placeholder} desteklenir. Çift satır
// (\n\n) yeni paragraf olarak render edilir.

export type FormSuccessKey = "inquiry" | "quote" | "appointment"

export type FormSuccessScreen = {
  title: string
  body: string
  ctaLabel: string
}

export type FormSuccessScreens = Record<FormSuccessKey, FormSuccessScreen>

export type FormSuccessMeta = {
  key: FormSuccessKey
  label: string
  description: string
  placeholders: string[]
  ctaHint: string
}

export const FORM_SUCCESS_META: FormSuccessMeta[] = [
  {
    key: "inquiry",
    label: "İletişim formu — gönderim sonrası",
    description:
      "İletişim sayfasındaki form gönderildikten sonra ziyaretçinin gördüğü kart.",
    placeholders: ["name"],
    ctaHint: "Forma sıfırdan dönmek için buton (örn: 'Yeni mesaj gönder').",
  },
  {
    key: "quote",
    label: "Teklif sihirbazı — gönderim sonrası",
    description:
      "Teklif sihirbazı 4. adımı tamamlandıktan sonra gösterilen başarı ekranı.",
    placeholders: ["name", "firstName", "channels", "date", "time"],
    ctaHint: "Sihirbazı sıfırlayan buton (örn: 'Yeni teklif gönder').",
  },
  {
    key: "appointment",
    label: "Randevu formu — gönderim sonrası",
    description:
      "Dijital reklamlar sayfasındaki paket modali içindeki randevu formu gönderildikten sonra gösterilen ekran.",
    placeholders: ["date", "hour"],
    ctaHint: "Modali kapatan buton (örn: 'Kapat').",
  },
]

export const DEFAULT_FORM_SUCCESS: FormSuccessScreens = {
  inquiry: {
    title: "Mesajınız bize ulaştı.",
    body: "24 saat içinde döneceğiz. Acil bir durumda telefonla ulaşmaktan çekinmeyin.",
    ctaLabel: "Yeni mesaj gönder",
  },
  quote: {
    title: "Teşekkürler {firstName}!",
    body: "Teklifiniz bize ulaştı. {channels} üzerinden {date} {time} için sizinle iletişime geçeceğiz.",
    ctaLabel: "Yeni teklif gönder",
  },
  appointment: {
    title: "Talebiniz alındı",
    body: "{date} günü saat {hour} civarında sizi arayacağız.\n\nBu sürede WhatsApp'tan da yazabilirsiniz.",
    ctaLabel: "Kapat",
  },
}

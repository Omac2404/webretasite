// Google Ads conversion wiring. The global gtag/Ads tag itself is pasted via
// /admin/kod-ekleme; these settings only carry the per-action "send_to"
// values (Conversion ID/Label) so the client bridge can fire the conversion
// EVENTS on top of it. Pure types — safe to import from client components.

export type AdsConversionsSettings = {
  // Master switch. Off = no conversion events fire even if values are set.
  enabled: boolean
  // Google Ads "send_to" values, format "AW-XXXXXXXXX/AbCdEfGhIj". Each is
  // optional — an empty value means that action isn't reported as a
  // conversion. Google gives you this exact string when you create the
  // conversion action ("Etiketi yükle" → gtag event snippet).
  formSendTo: string // teklif / iletişim / randevu formu gönderimi (lead)
  whatsappSendTo: string // herhangi bir WhatsApp tıklaması
  phoneSendTo: string // herhangi bir telefon / "hemen ara" tıklaması
}

export const DEFAULT_ADS_CONVERSIONS: AdsConversionsSettings = {
  enabled: false,
  formSendTo: "",
  whatsappSendTo: "",
  phoneSendTo: "",
}

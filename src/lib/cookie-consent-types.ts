// Admin-managed cookie consent notice. The site always tracks analytics
// (the operator wants cookies in every case); this banner is an
// informational acknowledgement, not an opt-in gate. Pure types — safe to
// import from client components.

export type CookieConsentSettings = {
  // Whether the notice is shown at all.
  enabled: boolean
  // Small heading above the message.
  title: string
  // Body text shown to the visitor.
  message: string
  // Accept button label (e.g. "Tamam").
  buttonLabel: string
  // Optional link to the cookie/privacy policy page; hidden when empty.
  policyUrl: string
  policyLabel: string
  // Re-show the notice this many hours after a visitor accepted it.
  reshowHours: number
  // Bumped whenever the admin "resets" consent — forces the notice to
  // reappear for every visitor regardless of their last acceptance.
  version: number
}

export const DEFAULT_COOKIE_CONSENT: CookieConsentSettings = {
  enabled: true,
  title: "Çerez Bildirimi",
  message:
    "Bu siteyi ziyaret ettiğinizde çerez politikamızı kabul etmiş olursunuz. Deneyiminizi iyileştirmek ve siteyi analiz etmek için çerezler kullanıyoruz.",
  buttonLabel: "Tamam",
  policyUrl: "",
  policyLabel: "Çerez Politikası",
  reshowHours: 24,
  version: 1,
}

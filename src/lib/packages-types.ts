// Types and constants for the dijital-reklamlar package data. Lives in
// its own file (no `node:fs`) so client components can import the types
// without pulling the file-system code into the browser bundle.

export type ChannelKey = "google" | "meta" | "360"
export type PackageKey = "basic" | "growth" | "premium"

export type Pkg = {
  key: PackageKey
  name: string
  tagline: string
  price: string
  audience: string[]
  items: string[]
  // Pre-filled WhatsApp message for this package's "WhatsApp'tan yazın"
  // CTA. Empty/undefined falls back to a generic auto-generated message.
  whatsappMessage?: string
}

export type Channel = {
  key: ChannelKey
  label: string
  // Sekme rozetinde ve adminde görünen kısa kanal adı. /dijital-reklamlar
  // sayfasında, kullanıcı bir tab seçtiğinde sayfa başlığı (h1) olarak
  // gösterilen ayrı bir başlık. Boş bırakılırsa label kullanılır — bu
  // geriye dönük uyumluluğu korur.
  pageTitle?: string
  short: string
  intro: string
  packages: Pkg[]
}

export type WhatsAppSettings = {
  // E.164-style digits only (e.g. "905321234567" — what wa.me expects).
  number: string
  // Human-readable form for display on the choice card (e.g. "+90 532 123 45 67").
  display: string
}

// /dijital-reklamlar sayfasının altındaki "Yurtdışı reklamları" tarzı CTA bloğu.
// Tek dokümanlık, admin'den /admin/paketler altında yönetilir.
export type GlobalCta = {
  kicker: string
  title: string
  body: string
  buttonLabel: string
  buttonHref: string
}

export type PackagesData = {
  channels: Channel[]
  whatsapp?: WhatsAppSettings
  globalCta?: GlobalCta
}

export const DEFAULT_GLOBAL_CTA: GlobalCta = {
  kicker: "Yurtdışı reklamları",
  title: "Globale satış mı yapmak istiyorsun?",
  body: "Avrupa, ABD ve MENA bölgelerine yönelik Google Ads ve Meta kampanyalarını lokalleştirilmiş yaratıcılar, ülkeye özel optimizasyon ve şeffaf raporlamayla biz yönetelim. Strateji ihtiyacınıza göre kurgulanır.",
  buttonLabel: "İletişime geçin",
  buttonHref: "/iletisim",
}

export const CHANNEL_ORDER: ChannelKey[] = ["google", "meta", "360"]
export const PACKAGE_ORDER: PackageKey[] = ["basic", "growth", "premium"]
export const MAX_AUDIENCE = 3
export const MAX_ITEMS = 12

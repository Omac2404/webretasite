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

export type PackagesData = {
  channels: Channel[]
  whatsapp?: WhatsAppSettings
}

export const CHANNEL_ORDER: ChannelKey[] = ["google", "meta", "360"]
export const PACKAGE_ORDER: PackageKey[] = ["basic", "growth", "premium"]
export const MAX_AUDIENCE = 3
export const MAX_ITEMS = 12

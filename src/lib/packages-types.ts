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
}

export type Channel = {
  key: ChannelKey
  label: string
  short: string
  intro: string
  packages: Pkg[]
}

export type PackagesData = {
  channels: Channel[]
}

export const CHANNEL_ORDER: ChannelKey[] = ["google", "meta", "360"]
export const PACKAGE_ORDER: PackageKey[] = ["basic", "growth", "premium"]
export const MAX_AUDIENCE = 3
export const MAX_ITEMS = 12

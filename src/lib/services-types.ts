// Service-card content (the two "Neler yaparız?" cards on the homepage).
// Client-safe — no `node:fs` here.

export type ServiceKey = "web" | "reklam"

export type ServiceCard = {
  key: ServiceKey
  title: string
  bullets: string[]
}

export type ServicesData = {
  cards: ServiceCard[]
}

// Hard limit on how many bullet rows the admin can fill in for one card.
// Enforced by the form (only 5 inputs) and by the action (extra entries
// are trimmed). Mirrored on the homepage when rendering.
export const MAX_BULLETS_PER_CARD = 5

// Friendly labels for the admin UI — keeps copy in one place.
export const SERVICE_LABELS: Record<ServiceKey, string> = {
  web: "Web Site",
  reklam: "Dijital Reklamlar",
}

export const SERVICE_KEYS: ServiceKey[] = ["web", "reklam"]

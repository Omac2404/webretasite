// Analytics types — client-safe (no node:fs).

export type EventType =
  | "page_view"
  | "section_view"
  | "section_dwell"
  | "click"
  | "tab_change"

export type ClientEvent = {
  // Generated on the client so the same event survives retries.
  id: string
  ts: string
  sessionId: string
  path: string
  type: EventType
  data?: Record<string, string | number>
}

export type StoredEvent = ClientEvent & {
  ip: string
  userAgent: string
}

export type AnalyticsData = {
  events: StoredEvent[]
}

// Unbounded — admin clears manually from the panel. With ~456B per
// event and 3k visitors/month, a year's worth is ~280 MB. Trivial on
// any hosting.
export const MAX_EVENTS = Infinity

// Human-friendly Turkish labels for events shown in the admin panel.
export const EVENT_LABEL: Record<EventType, string> = {
  page_view: "Sayfa görüntüledi",
  section_view: "Bölüm gördü",
  section_dwell: "Bölümde durdu",
  click: "Tıkladı",
  tab_change: "Sekme değiştirdi",
}

// Whitelist of sections we actually want to count dwell time for. The
// tracker only observes these (other [data-section] elements are
// ignored), and the admin stats table filters to the same set.
export const TRACKED_SECTIONS = [
  "projects",
  "testimonials",
  "referanslar",
] as const

// Turkish display names for the section ids used in [data-section].
export const SECTION_LABEL: Record<string, string> = {
  projects: "Projeler",
  testimonials: "Yorumlar",
  referanslar: "Referanslar",
}

export function sectionLabel(id: string): string {
  return SECTION_LABEL[id] ?? id
}

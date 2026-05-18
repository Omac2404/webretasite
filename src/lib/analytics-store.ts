// Server-only analytics store. The events file is append-mostly with a
// FIFO cap so it can't grow unbounded. Import the types from
// `./analytics-types` in client code.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  MAX_EVENTS,
  TRACKED_SECTIONS,
  type AnalyticsData,
  type ClientEvent,
  type StoredEvent,
} from "./analytics-types"

const ALLOWED_SECTIONS = new Set<string>(TRACKED_SECTIONS)

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json")

async function readData(): Promise<AnalyticsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AnalyticsData>
    return {
      events: Array.isArray(parsed.events) ? (parsed.events as StoredEvent[]) : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { events: [] }
    throw err
  }
}

async function writeData(data: AnalyticsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Serialize writes through a single in-memory promise chain so two
// concurrent POSTs don't read-modify-write the JSON file and lose each
// other's events. With Node.js running in a single process this is
// enough; in a multi-instance deployment we'd need a real DB.
let writeQueue: Promise<unknown> = Promise.resolve()

// Append events with the server-derived ip+userAgent. Drop the oldest
// events once we cross MAX_EVENTS so the file stays bounded.
export async function appendEvents(
  events: ClientEvent[],
  ip: string,
  userAgent: string,
): Promise<void> {
  if (events.length === 0) return
  const task = writeQueue.then(async () => {
    const data = await readData()
    for (const e of events) {
      data.events.push({ ...e, ip, userAgent })
    }
    if (Number.isFinite(MAX_EVENTS) && data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(-MAX_EVENTS)
    }
    await writeData(data)
  })
  // Keep the chain alive even if one task throws — otherwise a single
  // bad write would stall every subsequent append.
  writeQueue = task.catch(() => undefined)
  return task
}

export async function clearEvents(): Promise<void> {
  // Run through the write queue so any in-flight appends don't race
  // with the clear (otherwise an append could re-create the file
  // after we've emptied it).
  const task = writeQueue.then(() => writeData({ events: [] }))
  writeQueue = task.catch(() => undefined)
  return task
}

// Clear events for a single ISO day (YYYY-MM-DD in Europe/Istanbul).
export async function clearEventsForDay(day: string): Promise<void> {
  const task = writeQueue.then(async () => {
    const data = await readData()
    data.events = data.events.filter((e) => dayKey(e.ts) !== day)
    await writeData(data)
  })
  writeQueue = task.catch(() => undefined)
  return task
}

// Clear events for a single ISO month (YYYY-MM in Europe/Istanbul).
export async function clearEventsForMonth(month: string): Promise<void> {
  const task = writeQueue.then(async () => {
    const data = await readData()
    data.events = data.events.filter((e) => !dayKey(e.ts).startsWith(month))
    await writeData(data)
  })
  writeQueue = task.catch(() => undefined)
  return task
}

export async function readEvents(): Promise<StoredEvent[]> {
  const data = await readData()
  return data.events
}

// Day key in Europe/Istanbul, ISO format (YYYY-MM-DD). `sv-SE` is the
// laziest way to get an ISO-shaped date out of Intl.
const DAY_FMT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function dayKey(iso: string): string {
  return DAY_FMT.format(new Date(iso))
}

// Hour key in Europe/Istanbul (0-23).
const HOUR_FMT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  hourCycle: "h23",
})

export function hourKey(iso: string): number {
  return parseInt(HOUR_FMT.format(new Date(iso)), 10)
}

export function monthKey(iso: string): string {
  return dayKey(iso).slice(0, 7)
}

export type DayBucket = {
  day: string // YYYY-MM-DD
  events: number
  visitors: number
}

// Distinct days that have any events, newest first.
export function dayBuckets(events: StoredEvent[]): DayBucket[] {
  const map = new Map<string, { events: number; ips: Set<string> }>()
  for (const e of events) {
    const d = dayKey(e.ts)
    const cur = map.get(d) ?? { events: 0, ips: new Set<string>() }
    cur.events += 1
    cur.ips.add(e.ip)
    map.set(d, cur)
  }
  return [...map.entries()]
    .map(([day, { events: c, ips }]) => ({
      day,
      events: c,
      visitors: ips.size,
    }))
    .sort((a, b) => b.day.localeCompare(a.day))
}

export type MonthBucket = {
  month: string // YYYY-MM
  events: number
  visitors: number
}

// Distinct months that have events, newest first.
export function monthBuckets(events: StoredEvent[]): MonthBucket[] {
  const map = new Map<string, { events: number; ips: Set<string> }>()
  for (const e of events) {
    const m = monthKey(e.ts)
    const cur = map.get(m) ?? { events: 0, ips: new Set<string>() }
    cur.events += 1
    cur.ips.add(e.ip)
    map.set(m, cur)
  }
  return [...map.entries()]
    .map(([month, { events: c, ips }]) => ({
      month,
      events: c,
      visitors: ips.size,
    }))
    .sort((a, b) => b.month.localeCompare(a.month))
}

// Daily breakdown for one calendar month — every day of the month gets
// a row, even if zero events, so the chart has a steady x-axis. The
// `month` parameter is "YYYY-MM" in Europe/Istanbul.
export function dailySeriesForMonth(
  events: StoredEvent[],
  month: string,
): { day: string; events: number; visitors: number }[] {
  const [yStr, mStr] = month.split("-")
  const year = parseInt(yStr, 10)
  const m = parseInt(mStr, 10)
  if (!year || !m) return []
  // Day 0 of next month = last day of this month.
  const lastDay = new Date(year, m, 0).getDate()
  const monthEvents = events.filter((e) => dayKey(e.ts).startsWith(month))
  const dayMap = new Map<string, { events: number; ips: Set<string> }>()
  for (const e of monthEvents) {
    const d = dayKey(e.ts)
    const cur = dayMap.get(d) ?? { events: 0, ips: new Set<string>() }
    cur.events += 1
    cur.ips.add(e.ip)
    dayMap.set(d, cur)
  }
  const out: { day: string; events: number; visitors: number }[] = []
  for (let d = 1; d <= lastDay; d++) {
    const key = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const cur = dayMap.get(key)
    out.push({
      day: key,
      events: cur?.events ?? 0,
      visitors: cur?.ips.size ?? 0,
    })
  }
  return out
}

// 24-bar hourly distribution of events for the given scope.
export function hourlySeries(
  events: StoredEvent[],
): { hour: number; events: number }[] {
  const counts = new Array(24).fill(0)
  for (const e of events) counts[hourKey(e.ts)] += 1
  return counts.map((events, hour) => ({ hour, events }))
}

// ── Aggregates ─────────────────────────────────────────────────────────

export type Visitor = {
  ip: string
  sessionIds: string[]
  userAgent: string
  firstSeen: string
  lastSeen: string
  events: StoredEvent[]
}

// Group `events` by IP. Within each visitor, events are sorted newest
// first so the admin sees the latest activity at the top.
export function listVisitorsFrom(events: StoredEvent[]): Visitor[] {
  const map = new Map<string, Visitor>()
  for (const e of events) {
    const existing = map.get(e.ip)
    if (!existing) {
      map.set(e.ip, {
        ip: e.ip,
        sessionIds: [e.sessionId],
        userAgent: e.userAgent,
        firstSeen: e.ts,
        lastSeen: e.ts,
        events: [e],
      })
    } else {
      if (!existing.sessionIds.includes(e.sessionId)) {
        existing.sessionIds.push(e.sessionId)
      }
      if (e.ts < existing.firstSeen) existing.firstSeen = e.ts
      if (e.ts > existing.lastSeen) existing.lastSeen = e.ts
      // Keep the freshest userAgent — useful when a visitor's UA changes.
      if (e.ts >= existing.lastSeen) existing.userAgent = e.userAgent
      existing.events.push(e)
    }
  }
  const visitors = Array.from(map.values())
  for (const v of visitors) {
    v.events.sort((a, b) => b.ts.localeCompare(a.ts))
  }
  visitors.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
  return visitors
}

export type Tally = { key: string; count: number; meta?: string }

// Top N pages by page_view count, over the given events.
export function topPagesFrom(events: StoredEvent[], limit = 10): Tally[] {
  const counts = new Map<string, number>()
  for (const e of events) {
    if (e.type !== "page_view") continue
    counts.set(e.path, (counts.get(e.path) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Top N click / tab_change targets over the given events.
export function topClicksFrom(events: StoredEvent[], limit = 10): Tally[] {
  const counts = new Map<string, number>()
  for (const e of events) {
    if (e.type !== "click" && e.type !== "tab_change") continue
    const target = String(e.data?.target ?? e.data?.value ?? "?")
    const compoundKey =
      e.type === "tab_change"
        ? `tab:${e.data?.control ?? "?"}:${e.data?.value ?? "?"}`
        : target
    counts.set(compoundKey, (counts.get(compoundKey) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Top N sections by total dwell time across the given events. Only
// sections on the TRACKED_SECTIONS allowlist are included — old events
// for retired sections (hero/logos/services/home-blog) get filtered out.
export function topSectionsFrom(events: StoredEvent[], limit = 10): Tally[] {
  const totals = new Map<string, { total: number; count: number }>()
  for (const e of events) {
    if (e.type !== "section_dwell") continue
    const id = String(e.data?.section ?? "?")
    if (!ALLOWED_SECTIONS.has(id)) continue
    const dur = Number(e.data?.durationMs ?? 0)
    const cur = totals.get(id) ?? { total: 0, count: 0 }
    cur.total += dur
    cur.count += 1
    totals.set(id, cur)
  }
  return [...totals.entries()]
    .map(([key, { total, count }]) => ({
      key,
      count,
      total,
      meta: `${Math.round(total / 1000)}s toplam · ${count} izlenme · ort. ${Math.round(total / count / 1000)}s`,
    }))
    .sort((a, b) => b.total - a.total)
    .map(({ key, count, meta }) => ({ key, count, meta }))
    .slice(0, limit)
}

// File-based log of unmatched URLs (genuine 404s) seen by the public
// site. Populated by the root catch-all route after the redirect
// middleware has had its chance — so anything that lands here is a path
// with no redirect rule AND no real page.
//
// The admin "Yönlendirmeler" panel surfaces this list as "haritalanmamış
// 404'ler" so stragglers from the WordPress migration that the initial
// inventory missed can be spotted and mapped with one click.
//
// Server-only: relies on node:fs.

import { promises as fs } from "node:fs"
import path from "node:path"

const DATA_FILE = path.join(process.cwd(), "data", "notfound-log.json")
// Keep the most-recently-seen N paths; older ones fall off the tail.
const MAX_ENTRIES = 300

export type NotFoundEntry = {
  path: string
  count: number
  firstSeen: string // ISO
  lastSeen: string // ISO
}

type NotFoundData = { entries: NotFoundEntry[] }

// Skip asset-like paths and known noise so the log stays a list of
// content URLs worth redirecting, not a dumping ground for bot probes.
const ASSET_EXT = /\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|txt|xml|json|pdf|zip|mp4|webm|mp3)$/i

function shouldSkip(p: string): boolean {
  if (!p.startsWith("/")) return true
  if (p.startsWith("/admin")) return true
  if (p.startsWith("/_next") || p.startsWith("/api")) return true
  if (ASSET_EXT.test(p)) return true
  if (p.length > 512) return true
  return false
}

async function readData(): Promise<NotFoundData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<NotFoundData>
    return {
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.map((e) => ({
            path: String(e.path ?? ""),
            count: typeof e.count === "number" ? e.count : 1,
            firstSeen: String(e.firstSeen ?? new Date().toISOString()),
            lastSeen: String(e.lastSeen ?? new Date().toISOString()),
          }))
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { entries: [] }
    throw err
  }
}

async function writeData(data: NotFoundData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Serialize writes; also throttle repeat hits of the same path in-memory
// so a bot hammering one URL doesn't rewrite the file on every request.
let writeQueue: Promise<unknown> = Promise.resolve()
const recentlyWritten = new Map<string, number>()
const THROTTLE_MS = 30_000

export async function logNotFound(rawPath: string): Promise<void> {
  const p = rawPath || "/"
  if (shouldSkip(p)) return

  const now = Date.now()
  const last = recentlyWritten.get(p)
  if (last != null && now - last < THROTTLE_MS) return
  recentlyWritten.set(p, now)
  // Bound the throttle map so it can't grow without limit.
  if (recentlyWritten.size > 1000) recentlyWritten.clear()

  const nowIso = new Date().toISOString()
  const task = writeQueue.then(async () => {
    const data = await readData()
    const existing = data.entries.find((e) => e.path === p)
    if (existing) {
      existing.count++
      existing.lastSeen = nowIso
    } else {
      data.entries.push({ path: p, count: 1, firstSeen: nowIso, lastSeen: nowIso })
    }
    // Sort by recency and cap.
    data.entries.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1))
    if (data.entries.length > MAX_ENTRIES) {
      data.entries = data.entries.slice(0, MAX_ENTRIES)
    }
    await writeData(data)
  })
  writeQueue = task.catch(() => undefined)
  return task
}

export async function readNotFoundLog(): Promise<NotFoundEntry[]> {
  const { entries } = await readData()
  // Most hits first — the highest-traffic stragglers are worth mapping.
  return entries.sort((a, b) => b.count - a.count)
}

export async function removeNotFound(p: string): Promise<void> {
  const task = writeQueue.then(async () => {
    const data = await readData()
    data.entries = data.entries.filter((e) => e.path !== p)
    await writeData(data)
  })
  writeQueue = task.catch(() => undefined)
  recentlyWritten.delete(p)
  return task
}

export async function clearNotFoundLog(): Promise<void> {
  const task = writeQueue.then(async () => {
    await writeData({ entries: [] })
  })
  writeQueue = task.catch(() => undefined)
  recentlyWritten.clear()
  return task
}

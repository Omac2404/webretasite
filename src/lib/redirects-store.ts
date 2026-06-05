// File-based store for admin-managed URL redirects. Powers the WordPress
// → Next.js migration: old indexed URLs are matched here and 301'd to
// their new home so years of Google links don't 404.
//
// Two consumers:
//   1. The route middleware (proxy.ts, Node runtime) reads the rules via
//      `readRedirectsCached()` on every public request and issues the
//      redirect. The cache is invalidated by file mtime so admin edits
//      take effect immediately without a redeploy.
//   2. The admin panel reads/writes the full document via the CRUD
//      helpers below.
//
// Server-only: relies on node:fs and must never be imported from a
// client component. The pure `matchRedirect()` function has no fs
// dependency and is safe to call from the middleware hot path.

import { promises as fs } from "node:fs"
import path from "node:path"

// "exact"  → pathname must equal source (after trailing-slash normalize)
// "prefix" → pathname equals source OR sits under source/… (whole subtree)
// "regex"  → source is a JS RegExp; destination may reference $1, $2…
export type MatchType = "exact" | "prefix" | "regex"

export type Redirect = {
  id: string
  source: string
  destination: string
  matchType: MatchType
  // true → 301 (permanent, the SEO-preserving default). false → 302,
  // useful while testing because browsers don't hard-cache it.
  permanent: boolean
  enabled: boolean
  // Append the incoming query string to the destination when set.
  preserveQuery: boolean
  hits: number
  createdAt: string
  note?: string
}

export type RedirectsData = { redirects: Redirect[] }

const DATA_FILE = path.join(process.cwd(), "data", "redirects.json")
const EMPTY: RedirectsData = { redirects: [] }

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeType(value: unknown): MatchType {
  return value === "prefix" || value === "regex"
    ? (value as MatchType)
    : "exact"
}

function normalizeRule(raw: Partial<Redirect>): Redirect {
  return {
    id: String(raw.id ?? makeId()),
    source: String(raw.source ?? "").trim(),
    destination: String(raw.destination ?? "").trim(),
    matchType: normalizeType(raw.matchType),
    permanent: raw.permanent !== false,
    enabled: raw.enabled !== false,
    preserveQuery: raw.preserveQuery === true,
    hits: typeof raw.hits === "number" ? raw.hits : 0,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    note: typeof raw.note === "string" && raw.note.trim() ? raw.note.trim() : undefined,
  }
}

export async function readRedirects(): Promise<RedirectsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<RedirectsData>
    return {
      redirects: Array.isArray(parsed.redirects)
        ? parsed.redirects.map(normalizeRule)
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { redirects: [] }
    throw err
  }
}

// Serialize writes so concurrent admin actions don't clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve()

async function writeRedirects(data: RedirectsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function enqueue<T>(work: (data: RedirectsData) => Promise<T> | T): Promise<T> {
  const task = writeQueue.then(async () => {
    const data = await readRedirects()
    const result = await work(data)
    await writeRedirects(data)
    return result
  })
  writeQueue = task.catch(() => undefined)
  return task
}

export async function addRedirect(input: {
  source: string
  destination: string
  matchType: MatchType
  permanent: boolean
  preserveQuery: boolean
  note?: string
}): Promise<Redirect> {
  const rule = normalizeRule({ ...input, id: makeId(), createdAt: new Date().toISOString() })
  return enqueue((data) => {
    data.redirects.unshift(rule)
    return rule
  })
}

export async function updateRedirect(
  id: string,
  patch: Partial<Omit<Redirect, "id" | "createdAt" | "hits">>,
): Promise<void> {
  await enqueue((data) => {
    const rule = data.redirects.find((r) => r.id === id)
    if (!rule) return
    Object.assign(rule, normalizeRule({ ...rule, ...patch, id: rule.id, createdAt: rule.createdAt, hits: rule.hits }))
  })
}

export async function deleteRedirect(id: string): Promise<void> {
  await enqueue((data) => {
    data.redirects = data.redirects.filter((r) => r.id !== id)
  })
}

export async function toggleRedirect(id: string): Promise<void> {
  await enqueue((data) => {
    const rule = data.redirects.find((r) => r.id === id)
    if (rule) rule.enabled = !rule.enabled
  })
}

// Bulk import: each line is "source,destination" (or "source<TAB>destination").
// Lines are added as exact, permanent rules. Returns how many were added
// and how many were skipped as duplicates/invalid.
export async function importRedirects(
  lines: Array<{ source: string; destination: string }>,
): Promise<{ added: number; skipped: number }> {
  return enqueue((data) => {
    const existing = new Set(data.redirects.map((r) => normalizePath(r.source).toLowerCase()))
    let added = 0
    let skipped = 0
    for (const { source, destination } of lines) {
      const src = source.trim()
      const dest = destination.trim()
      if (!src || !dest || !src.startsWith("/")) {
        skipped++
        continue
      }
      const key = normalizePath(src).toLowerCase()
      if (existing.has(key)) {
        skipped++
        continue
      }
      existing.add(key)
      data.redirects.unshift(
        normalizeRule({
          id: makeId(),
          source: src,
          destination: dest,
          matchType: "exact",
          permanent: true,
          enabled: true,
          preserveQuery: false,
          createdAt: new Date().toISOString(),
        }),
      )
      added++
    }
    return { added, skipped }
  })
}

// ---------------------------------------------------------------------------
// Hot-path matching — used by the middleware on every public request.
// ---------------------------------------------------------------------------

// Strip a single trailing slash (keep root "/") so "/x" and "/x/" match
// the same rule. WordPress permalinks almost always carry the slash.
export function normalizePath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1)
  return p
}

export type RedirectMatch = { id: string; destination: string; permanent: boolean }

// Returns the first enabled rule that matches `pathname`, or null. Rules
// are evaluated in stored order (newest first), so a specific exact rule
// added later wins over an older broad prefix/regex rule. `search` is the
// raw query string including the leading "?" (or "").
export function matchRedirect(
  pathname: string,
  search: string,
  rules: Redirect[],
): RedirectMatch | null {
  const reqPath = normalizePath(pathname)
  const reqLower = reqPath.toLowerCase()

  for (const r of rules) {
    if (!r.enabled || !r.source || !r.destination) continue

    let dest: string | null = null
    if (r.matchType === "exact") {
      if (reqLower === normalizePath(r.source).toLowerCase()) dest = r.destination
    } else if (r.matchType === "prefix") {
      const src = normalizePath(r.source).toLowerCase()
      if (reqLower === src || reqLower.startsWith(src + "/")) dest = r.destination
    } else {
      try {
        const re = new RegExp(r.source)
        if (re.test(reqPath)) dest = reqPath.replace(re, r.destination)
      } catch {
        // Invalid regex in the stored rule — skip rather than crash the
        // middleware for every request.
        continue
      }
    }
    if (dest == null) continue

    // Loop guard: never redirect a path to itself.
    const destPath = dest.split(/[?#]/)[0]
    if (!/^https?:\/\//i.test(dest) && normalizePath(destPath) === reqPath) continue

    if (r.preserveQuery && search) {
      const qs = search.replace(/^\?/, "")
      dest += (dest.includes("?") ? "&" : "?") + qs
    }
    return { id: r.id, destination: dest, permanent: r.permanent }
  }
  return null
}

// mtime-cached reader for the middleware. The middleware runs in its own
// bundle, so this module-level cache is private to it; we key on the
// file's mtime so any admin write (from the server bundle) is picked up
// on the next request without restarting.
let cache: { mtimeMs: number; rules: Redirect[] } | null = null

export async function readRedirectsCached(): Promise<Redirect[]> {
  try {
    const stat = await fs.stat(DATA_FILE)
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.rules
    const { redirects } = await readRedirects()
    cache = { mtimeMs: stat.mtimeMs, rules: redirects }
    return redirects
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      cache = { mtimeMs: -1, rules: [] }
      return []
    }
    throw err
  }
}

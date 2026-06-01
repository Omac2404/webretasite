// Lightweight spam guard for public forms. Two layers:
//
//   1. Honeypot — a hidden form field that real users never fill but
//      naïve bots dump strings into. If it's non-empty we silently
//      reject the submission (return success-shaped error so the bot
//      doesn't learn the trick).
//
//   2. Per-IP rate limit — process-memory sliding window. Caps bursts
//      from a single source. In-memory means a server restart resets
//      counters; that's acceptable for the traffic profile here and
//      avoids a Redis dependency.

import { headers } from "next/headers"

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const DEFAULT_MAX = 5

// Map<key, timestamps[]>. Old entries get pruned on read.
const buckets = new Map<string, number[]>()

export async function clientIp(): Promise<string> {
  const h = await headers()
  const xff = h.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const xri = h.get("x-real-ip")
  if (xri) return xri.trim()
  return "anonymous"
}

export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0
}

// Returns true if the request is allowed; false if rate limit exceeded.
// `formKey` namespaces the bucket so a flooded contact form doesn't
// block a separate quote submission from the same IP.
export async function checkRateLimit(
  formKey: string,
  max: number = DEFAULT_MAX,
): Promise<boolean> {
  const ip = await clientIp()
  const key = `${formKey}:${ip}`
  const now = Date.now()
  const cutoff = now - WINDOW_MS
  const arr = buckets.get(key) ?? []
  // Drop expired entries first to keep memory bounded.
  const recent = arr.filter((t) => t > cutoff)
  if (recent.length >= max) {
    buckets.set(key, recent)
    return false
  }
  recent.push(now)
  buckets.set(key, recent)
  return true
}

// Common name for the honeypot field — short, plausible, looks like a
// real field to a bot's regex (website-style names attract them).
export const HONEYPOT_FIELD = "website_url"

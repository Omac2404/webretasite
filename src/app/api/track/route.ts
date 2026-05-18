import { NextResponse } from "next/server"
import { appendEvents } from "@/lib/analytics-store"
import { readAnalyticsSettings } from "@/lib/analytics-settings"
import type { ClientEvent } from "@/lib/analytics-types"

export const dynamic = "force-dynamic"

// Pull the client IP out of the request — works behind common proxies
// (Vercel sets x-real-ip / x-forwarded-for, dev set neither).
function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const xri = request.headers.get("x-real-ip")
  if (xri) return xri.trim()
  return "127.0.0.1"
}

export async function POST(request: Request) {
  try {
    // Short-circuit before reading the body if tracking is off — no
    // event file is read or written. Cheapest path when disabled.
    const settings = await readAnalyticsSettings()
    if (!settings.enabled) {
      return NextResponse.json({ ok: true, written: 0, disabled: true })
    }
    const body = await request.json()
    const events: ClientEvent[] = Array.isArray(body?.events) ? body.events : []
    if (events.length === 0) {
      return NextResponse.json({ ok: true, written: 0 })
    }
    // Cheap sanity filter — drop events without the required fields.
    const clean = events.filter(
      (e) =>
        typeof e?.id === "string" &&
        typeof e?.ts === "string" &&
        typeof e?.sessionId === "string" &&
        typeof e?.path === "string" &&
        typeof e?.type === "string",
    )
    const ua = request.headers.get("user-agent") ?? ""
    await appendEvents(clean, clientIp(request), ua)
    return NextResponse.json({ ok: true, written: clean.length })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

// Convenience GET — returns the caller's IP plus the tracker's enabled
// state. The admin panel uses this to figure out which visitor row to
// highlight as "Sen"; the client tracker reads `enabled` to skip event
// emission when admin has flipped tracking off.
export async function GET(request: Request) {
  const settings = await readAnalyticsSettings()
  return NextResponse.json({
    ip: clientIp(request),
    enabled: settings.enabled,
  })
}

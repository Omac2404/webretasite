import { NextResponse } from "next/server"
import { readEvents } from "@/lib/analytics-store"
import type { StoredEvent } from "@/lib/analytics-types"

export const dynamic = "force-dynamic"

// CSV export of all analytics events for offline archiving. Schema is
// flat — type, timestamp, path, IP, sessionId, plus the type-specific
// data fields collapsed into a single JSON column to stay flexible.

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function row(e: StoredEvent): string {
  const cells = [
    e.id,
    e.ts,
    e.type,
    e.path,
    e.ip,
    e.sessionId,
    e.userAgent,
    JSON.stringify(e.data ?? {}),
  ].map((c) => csvEscape(String(c ?? "")))
  return cells.join(",")
}

export async function GET() {
  const events = await readEvents()
  const header = ["id", "ts", "type", "path", "ip", "sessionId", "userAgent", "data"].join(",")
  const body = [header, ...events.map(row)].join("\n") + "\n"
  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="webreta-analitik-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

import { promises as fs } from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Bundle every JSON file in /data into a single download so the admin
// has a one-shot backup. Returns the raw object; the admin can re-import
// by manually placing files back, which keeps the format trivially debuggable.
export async function GET() {
  const dir = path.join(process.cwd(), "data")
  const out: Record<string, unknown> = {}
  try {
    const entries = await fs.readdir(dir)
    for (const name of entries) {
      if (!name.endsWith(".json")) continue
      try {
        const raw = await fs.readFile(path.join(dir, name), "utf8")
        out[name.replace(/\.json$/, "")] = JSON.parse(raw)
      } catch {
        // Skip malformed files rather than failing the entire backup.
      }
    }
  } catch {
    // /data may not exist on a fresh install — return an empty backup.
  }

  const today = new Date().toISOString().slice(0, 10)
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), data: out },
    null,
    2,
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="webreta-backup-${today}.json"`,
      "Cache-Control": "no-store",
    },
  })
}

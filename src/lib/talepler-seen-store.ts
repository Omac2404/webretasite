// Tracks the timestamp of the admin's last visit to /admin/talepler so
// the sidebar can show "X unread" badges. Single global cursor for now;
// multi-admin support would per-user this.

import { promises as fs } from "node:fs"
import path from "node:path"

const DATA_FILE = path.join(process.cwd(), "data", "talepler-seen.json")

type SeenState = { lastSeenAt: string }

export async function readSeen(): Promise<SeenState> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<SeenState>
    return { lastSeenAt: typeof parsed.lastSeenAt === "string" ? parsed.lastSeenAt : "" }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { lastSeenAt: "" }
    throw err
  }
}

export async function markSeenNow(): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify({ lastSeenAt: new Date().toISOString() }, null, 2) + "\n",
    "utf8",
  )
}

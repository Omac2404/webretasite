// Server-only switch for the analytics pipeline. Stored in its own
// tiny JSON file so we can read it on every /api/track POST without
// loading the (potentially large) events file. Default = enabled.

import { promises as fs } from "node:fs"
import path from "node:path"

const SETTINGS_FILE = path.join(process.cwd(), "data", "analytics-settings.json")

type Settings = { enabled: boolean }
const DEFAULT: Settings = { enabled: true }

export async function readAnalyticsSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { enabled: parsed.enabled !== false }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT
    throw err
  }
}

export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true })
  await fs.writeFile(
    SETTINGS_FILE,
    JSON.stringify({ enabled }, null, 2) + "\n",
    "utf8",
  )
}

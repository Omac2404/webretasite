// Server-only: imports node:fs. Don't import from client components —
// pull the types from `./site-settings-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "./site-settings-types"

const DATA_FILE = path.join(process.cwd(), "data", "site-settings.json")

function normalize(input: unknown): SiteSettings {
  const raw = (input ?? {}) as Partial<SiteSettings>
  const m = (raw.maintenance ?? {}) as Partial<SiteSettings["maintenance"]>
  return {
    faviconUrl:
      typeof raw.faviconUrl === "string" ? raw.faviconUrl.trim() : "",
    logoUrl:
      typeof raw.logoUrl === "string" ? raw.logoUrl.trim() : "",
    maintenance: {
      enabled: Boolean(m.enabled),
      message: typeof m.message === "string" ? m.message : "",
    },
  }
}

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_SITE_SETTINGS }
    }
    throw err
  }
}

export async function writeSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  const current = await readSiteSettings()
  const next = normalize({ ...current, ...patch })
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
}

// Server-only: imports node:fs. Don't import from client components —
// pull the types from `./site-code-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import { DEFAULT_SITE_CODE, type SiteCodeSettings } from "./site-code-types"

const DATA_FILE = path.join(process.cwd(), "data", "site-code.json")

function normalize(input: unknown): SiteCodeSettings {
  const raw = (input ?? {}) as Partial<SiteCodeSettings>
  return {
    headEnabled:
      typeof raw.headEnabled === "boolean"
        ? raw.headEnabled
        : DEFAULT_SITE_CODE.headEnabled,
    headCode: typeof raw.headCode === "string" ? raw.headCode : "",
    bodyEnabled:
      typeof raw.bodyEnabled === "boolean"
        ? raw.bodyEnabled
        : DEFAULT_SITE_CODE.bodyEnabled,
    bodyCode: typeof raw.bodyCode === "string" ? raw.bodyCode : "",
  }
}

export async function readSiteCode(): Promise<SiteCodeSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_SITE_CODE }
    }
    throw err
  }
}

async function write(next: SiteCodeSettings): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
}

export async function writeSiteCode(
  patch: Partial<SiteCodeSettings>,
): Promise<void> {
  const current = await readSiteCode()
  await write(normalize({ ...current, ...patch }))
}

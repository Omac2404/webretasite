// Server-only: imports node:fs. Don't import from client components —
// pull the types from `./ads-conversions-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_ADS_CONVERSIONS,
  type AdsConversionsSettings,
} from "./ads-conversions-types"

const DATA_FILE = path.join(process.cwd(), "data", "ads-conversions.json")

function normalize(input: unknown): AdsConversionsSettings {
  const raw = (input ?? {}) as Partial<AdsConversionsSettings>
  const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "")
  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : DEFAULT_ADS_CONVERSIONS.enabled,
    formSendTo: str(raw.formSendTo),
    whatsappSendTo: str(raw.whatsappSendTo),
    phoneSendTo: str(raw.phoneSendTo),
  }
}

export async function readAdsConversions(): Promise<AdsConversionsSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_ADS_CONVERSIONS }
    }
    throw err
  }
}

async function write(next: AdsConversionsSettings): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
}

export async function writeAdsConversions(
  patch: Partial<AdsConversionsSettings>,
): Promise<void> {
  const current = await readAdsConversions()
  await write(normalize({ ...current, ...patch }))
}

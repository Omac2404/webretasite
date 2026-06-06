// Server-only: imports node:fs. Don't import from client components —
// pull the types from `./cookie-consent-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_COOKIE_CONSENT,
  type CookieConsentSettings,
} from "./cookie-consent-types"

const DATA_FILE = path.join(process.cwd(), "data", "cookie-consent.json")

function normalize(input: unknown): CookieConsentSettings {
  const raw = (input ?? {}) as Partial<CookieConsentSettings>
  const reshow = Number(raw.reshowHours)
  const version = Number(raw.version)
  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : DEFAULT_COOKIE_CONSENT.enabled,
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : DEFAULT_COOKIE_CONSENT.title,
    message:
      typeof raw.message === "string" && raw.message.trim()
        ? raw.message.trim()
        : DEFAULT_COOKIE_CONSENT.message,
    buttonLabel:
      typeof raw.buttonLabel === "string" && raw.buttonLabel.trim()
        ? raw.buttonLabel.trim()
        : DEFAULT_COOKIE_CONSENT.buttonLabel,
    policyUrl: typeof raw.policyUrl === "string" ? raw.policyUrl.trim() : "",
    policyLabel:
      typeof raw.policyLabel === "string" && raw.policyLabel.trim()
        ? raw.policyLabel.trim()
        : DEFAULT_COOKIE_CONSENT.policyLabel,
    // Clamp the re-show window to a sane 1h–8760h (1 year) range.
    reshowHours:
      Number.isFinite(reshow) && reshow >= 1
        ? Math.min(Math.round(reshow), 8760)
        : DEFAULT_COOKIE_CONSENT.reshowHours,
    version:
      Number.isFinite(version) && version >= 1
        ? Math.round(version)
        : DEFAULT_COOKIE_CONSENT.version,
  }
}

export async function readCookieConsent(): Promise<CookieConsentSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_COOKIE_CONSENT }
    }
    throw err
  }
}

async function write(next: CookieConsentSettings): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
}

export async function writeCookieConsent(
  patch: Partial<CookieConsentSettings>,
): Promise<void> {
  const current = await readCookieConsent()
  await write(normalize({ ...current, ...patch }))
}

// "Reset": bump the version so the notice reappears for everyone, no matter
// when they last accepted it. Returns the new version.
export async function bumpCookieConsentVersion(): Promise<number> {
  const current = await readCookieConsent()
  const next = { ...current, version: current.version + 1 }
  await write(next)
  return next.version
}

// Server-only footer config store. Single-document JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_FOOTER,
  SOCIAL_PLATFORMS,
  type FooterConfig,
  type SocialPlatform,
} from "./footer-types"

const DATA_FILE = path.join(process.cwd(), "data", "footer.json")

function normalizeSocials(
  raw: Partial<Record<string, unknown>> | undefined,
): Record<SocialPlatform, string> {
  const out = { ...DEFAULT_FOOTER.socials }
  if (!raw) return out
  for (const { key } of SOCIAL_PLATFORMS) {
    const v = raw[key]
    if (typeof v === "string") out[key] = v
  }
  return out
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => String(v ?? "").trim())
    .filter((v) => v.length > 0)
}

function normalize(raw: Partial<FooterConfig>): FooterConfig {
  const contactRaw = raw.contact ?? {}
  return {
    titleLeading: String(raw.titleLeading ?? DEFAULT_FOOTER.titleLeading),
    titleHighlight: String(
      raw.titleHighlight ?? DEFAULT_FOOTER.titleHighlight,
    ),
    titleTrailing: String(raw.titleTrailing ?? DEFAULT_FOOTER.titleTrailing),
    subtitle: String(raw.subtitle ?? DEFAULT_FOOTER.subtitle),
    ctaLabel: String(raw.ctaLabel ?? DEFAULT_FOOTER.ctaLabel),
    ctaHref: String(raw.ctaHref ?? DEFAULT_FOOTER.ctaHref),
    copyright: String(raw.copyright ?? DEFAULT_FOOTER.copyright),
    contact: {
      email: String(contactRaw.email ?? DEFAULT_FOOTER.contact.email),
      phone: String(contactRaw.phone ?? DEFAULT_FOOTER.contact.phone),
      address: String(contactRaw.address ?? DEFAULT_FOOTER.contact.address),
    },
    socials: normalizeSocials(
      raw.socials as Partial<Record<string, unknown>> | undefined,
    ),
    navHrefs: (() => {
      const arr = normalizeStringArray(raw.navHrefs)
      return arr.length > 0 ? arr : DEFAULT_FOOTER.navHrefs
    })(),
    legalPageIds: normalizeStringArray(raw.legalPageIds),
  }
}

export async function readFooter(): Promise<FooterConfig> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<FooterConfig>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_FOOTER }
    }
    throw err
  }
}

export async function writeFooter(config: FooterConfig): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(config), null, 2) + "\n",
    "utf8",
  )
}

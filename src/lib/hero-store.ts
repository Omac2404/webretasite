// File-based store for the homepage hero block — subheadline copy and
// the two CTA buttons (label + href each). Admin-managed via the panel.
// Same pattern as the other content stores; server-only.

import { promises as fs } from "node:fs"
import path from "node:path"

export type HeroButton = {
  label: string
  href: string
}

export type HeroData = {
  subheadline: string
  primaryButton: HeroButton
  secondaryButton: HeroButton
}

const DATA_FILE = path.join(process.cwd(), "data", "hero.json")

const DEFAULT_HERO: HeroData = {
  subheadline:
    "Hazır temalar değil. Hızlı, modern ve markanıza sıfırdan kodlanmış web çözümleri.",
  primaryButton: { label: "Projemi konuşalım", href: "/web-site" },
  secondaryButton: { label: "Çalışmalarımız", href: "/iletisim" },
}

function normalizeButton(value: unknown, fallback: HeroButton): HeroButton {
  const v = (value ?? {}) as Partial<HeroButton>
  return {
    label:
      typeof v.label === "string" && v.label.trim() ? v.label.trim() : fallback.label,
    href:
      typeof v.href === "string" && v.href.trim() ? v.href.trim() : fallback.href,
  }
}

export async function readHero(): Promise<HeroData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<HeroData>
    return {
      subheadline:
        typeof parsed.subheadline === "string" && parsed.subheadline.trim()
          ? parsed.subheadline.trim()
          : DEFAULT_HERO.subheadline,
      primaryButton: normalizeButton(parsed.primaryButton, DEFAULT_HERO.primaryButton),
      secondaryButton: normalizeButton(
        parsed.secondaryButton,
        DEFAULT_HERO.secondaryButton,
      ),
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_HERO
    throw err
  }
}

export async function writeHero(data: HeroData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

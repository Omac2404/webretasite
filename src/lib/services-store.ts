// Server-only: imports node:fs. Use `./services-types` from client code.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  MAX_BULLETS_PER_CARD,
  SERVICE_KEYS,
  type ServiceCard,
  type ServiceKey,
  type ServicesData,
} from "./services-types"

const DATA_FILE = path.join(process.cwd(), "data", "services.json")

// Fallback used both for first-paint defaults and when the JSON file is
// missing/corrupt. Matches the strings that used to be hardcoded in
// src/app/page.tsx so the homepage looks the same before any admin
// edits happen.
const DEFAULTS: Record<ServiceKey, ServiceCard> = {
  web: {
    key: "web",
    title: "Web Site",
    bullets: [
      "Next.js + TypeScript ile modern altyapı",
      "Tasarımdan SEO'ya uçtan uca süreç",
      "Lighthouse 95+ performans hedefi",
    ],
  },
  reklam: {
    key: "reklam",
    title: "Dijital Reklamlar",
    bullets: [
      "Google Ads & Meta Ads yönetimi",
      "Performans odaklı kampanya stratejisi",
      "Şeffaf ve sade raporlama paneli",
    ],
  },
}

function normalizeBullets(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((b) => String(b ?? "").trim())
    .filter(Boolean)
    .slice(0, MAX_BULLETS_PER_CARD)
}

function normalizeCard(key: ServiceKey, raw: Partial<ServiceCard>): ServiceCard {
  return {
    key,
    title: String(raw.title ?? DEFAULTS[key].title),
    bullets: normalizeBullets(raw.bullets),
  }
}

// Build the full card list, filling in any missing key with defaults so
// the homepage never crashes from a partial JSON file.
function buildCards(stored: Map<ServiceKey, Partial<ServiceCard>>): ServiceCard[] {
  return SERVICE_KEYS.map((key) =>
    normalizeCard(key, stored.get(key) ?? DEFAULTS[key]),
  )
}

export async function readServices(): Promise<ServicesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<ServicesData> & {
      cards?: Array<Partial<ServiceCard>>
    }
    const byKey = new Map<ServiceKey, Partial<ServiceCard>>()
    if (Array.isArray(parsed.cards)) {
      for (const c of parsed.cards) {
        const k = c.key
        if (k === "web" || k === "reklam") byKey.set(k, c)
      }
    }
    return { cards: buildCards(byKey) }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { cards: buildCards(new Map()) }
    }
    throw err
  }
}

async function writeServices(data: ServicesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Save a single card. Other cards in the file stay untouched.
export async function setServiceCard(
  key: ServiceKey,
  input: { title: string; bullets: string[] },
): Promise<void> {
  const data = await readServices()
  const idx = data.cards.findIndex((c) => c.key === key)
  const next: ServiceCard = normalizeCard(key, input)
  if (idx >= 0) {
    data.cards[idx] = next
  } else {
    data.cards.push(next)
  }
  await writeServices(data)
}

// Bulk replace — used by the admin form which submits both cards at
// once. Same normalization rules apply.
export async function setAllServiceCards(
  inputs: Array<{ key: ServiceKey; title: string; bullets: string[] }>,
): Promise<void> {
  const byKey = new Map<ServiceKey, Partial<ServiceCard>>()
  for (const c of inputs) {
    if (c.key === "web" || c.key === "reklam") byKey.set(c.key, c)
  }
  await writeServices({ cards: buildCards(byKey) })
}

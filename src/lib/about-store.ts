// Server-only Hakkımızda store. Tek dokümanlık JSON.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_ABOUT,
  type AboutCta,
  type AboutData,
  type AboutHero,
  type AboutRow,
} from "./about-types"

const DATA_FILE = path.join(process.cwd(), "data", "about.json")

function s(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

function normalizeHero(raw: Partial<AboutHero> | undefined): AboutHero {
  const r = raw ?? {}
  return {
    kicker: s(r.kicker, DEFAULT_ABOUT.hero.kicker),
    titleLeader: s(r.titleLeader, DEFAULT_ABOUT.hero.titleLeader),
    titleHighlight: s(r.titleHighlight, DEFAULT_ABOUT.hero.titleHighlight),
    titleTrailer: s(r.titleTrailer, DEFAULT_ABOUT.hero.titleTrailer),
    subtitle: s(r.subtitle, DEFAULT_ABOUT.hero.subtitle),
  }
}

function normalizeRow(
  raw: Partial<AboutRow> | undefined,
  fallback: AboutRow,
): AboutRow {
  const r = raw ?? {}
  return {
    kicker: s(r.kicker, fallback.kicker),
    title: s(r.title, fallback.title),
    body: s(r.body, fallback.body),
    imageUrl: s(r.imageUrl, fallback.imageUrl),
    imageAlt: s(r.imageAlt, fallback.imageAlt),
    buttonLabel: s(r.buttonLabel, fallback.buttonLabel ?? ""),
    buttonHref: s(r.buttonHref, fallback.buttonHref ?? ""),
  }
}

function normalizeCta(raw: Partial<AboutCta> | undefined): AboutCta {
  const r = raw ?? {}
  return {
    title: s(r.title, DEFAULT_ABOUT.cta.title),
    body: s(r.body, DEFAULT_ABOUT.cta.body),
    buttonLabel: s(r.buttonLabel, DEFAULT_ABOUT.cta.buttonLabel),
    buttonHref: s(r.buttonHref, DEFAULT_ABOUT.cta.buttonHref),
  }
}

function normalize(raw: Partial<AboutData>): AboutData {
  return {
    hero: normalizeHero(raw.hero),
    row1: normalizeRow(raw.row1, DEFAULT_ABOUT.row1),
    row2: normalizeRow(raw.row2, DEFAULT_ABOUT.row2),
    cta: normalizeCta(raw.cta),
  }
}

export async function readAbout(): Promise<AboutData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AboutData>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_ABOUT }
    }
    throw err
  }
}

export async function writeAbout(next: AboutData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(normalize(next), null, 2) + "\n",
    "utf8",
  )
}

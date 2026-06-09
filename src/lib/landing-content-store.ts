// Server-only: imports node:fs. Don't import from client components —
// pull the types from `./landing-content-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_LANDING_CONTENT,
  LANDING_PAGES,
  MAX_LANDING_FAQS,
  MAX_LANDING_SECTIONS,
  type LandingContentData,
  type LandingPageContent,
  type LandingPageKey,
} from "./landing-content-types"

const DATA_FILE = path.join(process.cwd(), "data", "landing-content.json")

function clamp<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(0, max) : arr
}

function normalizePage(
  input: unknown,
  fallback: LandingPageContent,
): LandingPageContent {
  const raw = (input ?? {}) as Partial<LandingPageContent>
  const sections = Array.isArray(raw.sections)
    ? clamp(
        raw.sections
          .map((s) => ({
            heading: typeof s?.heading === "string" ? s.heading.trim() : "",
            body: typeof s?.body === "string" ? s.body : "",
          }))
          // Bir bölümün ya başlığı ya da gövdesi dolu olmalı.
          .filter((s) => s.heading.length > 0 || s.body.trim().length > 0),
        MAX_LANDING_SECTIONS,
      )
    : fallback.sections
  const faqs = Array.isArray(raw.faqs)
    ? clamp(
        raw.faqs
          .map((f) => ({
            question: typeof f?.question === "string" ? f.question.trim() : "",
            answer: typeof f?.answer === "string" ? f.answer.trim() : "",
          }))
          .filter((f) => f.question.length > 0 && f.answer.length > 0),
        MAX_LANDING_FAQS,
      )
    : fallback.faqs
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : fallback.enabled,
    sections,
    faqTitle:
      typeof raw.faqTitle === "string" && raw.faqTitle.trim()
        ? raw.faqTitle.trim()
        : fallback.faqTitle,
    faqs,
  }
}

function normalize(input: unknown): LandingContentData {
  const obj = (input ?? {}) as Partial<LandingContentData>
  const out = {} as LandingContentData
  for (const { key } of LANDING_PAGES) {
    out[key] = normalizePage(obj[key], DEFAULT_LANDING_CONTENT[key])
  }
  return out
}

export async function readLandingContent(): Promise<LandingContentData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return structuredClone(DEFAULT_LANDING_CONTENT)
    }
    throw err
  }
}

async function write(next: LandingContentData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
}

export async function updateLandingPage(
  key: LandingPageKey,
  content: LandingPageContent,
): Promise<void> {
  const current = await readLandingContent()
  current[key] = normalizePage(content, DEFAULT_LANDING_CONTENT[key])
  await write(current)
}

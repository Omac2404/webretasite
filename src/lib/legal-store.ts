// Server-only legal-pages store. Imports node:fs.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  slugifyLegal,
  type LegalPage,
  type LegalPagesData,
} from "./legal-types"

const DATA_FILE = path.join(process.cwd(), "data", "legal-pages.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(p: Partial<LegalPage>): LegalPage {
  const now = new Date().toISOString()
  return {
    id: String(p.id ?? makeId()),
    slug: String(p.slug ?? slugifyLegal(String(p.title ?? "sayfa"))),
    title: String(p.title ?? ""),
    body: String(p.body ?? ""),
    createdAt: String(p.createdAt ?? now),
    updatedAt: String(p.updatedAt ?? now),
  }
}

export async function readLegalPages(): Promise<LegalPagesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<LegalPagesData> & {
      pages?: Array<Partial<LegalPage>>
    }
    const pages = Array.isArray(parsed.pages) ? parsed.pages.map(normalize) : []
    return { pages }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { pages: [] }
    throw err
  }
}

async function writeLegalPages(data: LegalPagesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function getLegalPageById(id: string): Promise<LegalPage | null> {
  const data = await readLegalPages()
  return data.pages.find((p) => p.id === id) ?? null
}

export async function getLegalPageBySlug(
  slug: string,
): Promise<LegalPage | null> {
  const data = await readLegalPages()
  return data.pages.find((p) => p.slug === slug) ?? null
}

// Append a numeric suffix until the slug is unique. `excludeId` lets
// the edit flow keep the existing slug when the title is unchanged.
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const data = await readLegalPages()
  const taken = new Set(
    data.pages.filter((p) => p.id !== excludeId).map((p) => p.slug),
  )
  if (!taken.has(base)) return base
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function addLegalPage(input: {
  title: string
  body: string
}): Promise<LegalPage> {
  const data = await readLegalPages()
  const slug = await uniqueSlug(slugifyLegal(input.title))
  const now = new Date().toISOString()
  const page: LegalPage = {
    id: makeId(),
    slug,
    title: input.title,
    body: input.body.replace(/\r\n/g, "\n"),
    createdAt: now,
    updatedAt: now,
  }
  data.pages.unshift(page)
  await writeLegalPages(data)
  return page
}

export async function updateLegalPage(
  id: string,
  input: { title: string; body: string },
): Promise<void> {
  const data = await readLegalPages()
  const page = data.pages.find((p) => p.id === id)
  if (!page) return
  if (page.title !== input.title) {
    page.slug = await uniqueSlug(slugifyLegal(input.title), id)
  }
  page.title = input.title
  page.body = input.body.replace(/\r\n/g, "\n")
  page.updatedAt = new Date().toISOString()
  await writeLegalPages(data)
}

export async function deleteLegalPage(id: string): Promise<void> {
  const data = await readLegalPages()
  data.pages = data.pages.filter((p) => p.id !== id)
  await writeLegalPages(data)
}

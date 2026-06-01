// Server-only: imports node:fs.

import { promises as fs } from "node:fs"
import path from "node:path"
import type { Quote, QuotesData } from "./quotes-types"

const DATA_FILE = path.join(process.cwd(), "data", "quotes.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(q: Partial<Quote>): Quote {
  return {
    id: String(q.id ?? makeId()),
    name: String(q.name ?? ""),
    company: String(q.company ?? ""),
    email: String(q.email ?? ""),
    phone: String(q.phone ?? ""),
    industry: String(q.industry ?? ""),
    service: String(q.service ?? ""),
    serviceLabel: String(q.serviceLabel ?? ""),
    projectType: String(q.projectType ?? ""),
    description: String(q.description ?? ""),
    existingSiteUrl: String(q.existingSiteUrl ?? ""),
    refs: Array.isArray(q.refs) ? q.refs.map(String) : [],
    refNotes: String(q.refNotes ?? ""),
    channelLabels: Array.isArray(q.channelLabels)
      ? q.channelLabels.map(String)
      : [],
    date: String(q.date ?? ""),
    time: String(q.time ?? ""),
    mailUserSent: Boolean(q.mailUserSent),
    mailAdminSent: Boolean(q.mailAdminSent),
    mailError: q.mailError ? String(q.mailError) : undefined,
    createdAt: String(q.createdAt ?? new Date().toISOString()),
  }
}

export async function readQuotes(): Promise<QuotesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<QuotesData> & {
      quotes?: Array<Partial<Quote>>
    }
    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes.map(normalize) : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { quotes: [] }
    throw err
  }
}

async function writeQuotes(data: QuotesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Serialize writes so concurrent quote submissions don't lose each
// other's entries through a read-modify-write race.
let writeQueue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(task)
  writeQueue = p.catch(() => undefined)
  return p
}

export async function appendQuote(
  input: Omit<Quote, "id" | "createdAt">,
): Promise<Quote> {
  return enqueue(async () => {
    const data = await readQuotes()
    const quote = normalize({
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    })
    data.quotes.unshift(quote)
    await writeQuotes(data)
    return quote
  })
}

export async function deleteQuote(id: string): Promise<void> {
  await enqueue(async () => {
    const data = await readQuotes()
    data.quotes = data.quotes.filter((q) => q.id !== id)
    await writeQuotes(data)
  })
}

// Server-only: imports node:fs. Do not import from client components —
// pull the types from `./inquiries-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import { type InquiriesData, type Inquiry } from "./inquiries-types"

const DATA_FILE = path.join(process.cwd(), "data", "inquiries.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function readInquiries(): Promise<InquiriesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<InquiriesData>
    return { inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [] }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { inquiries: [] }
    throw err
  }
}

async function writeInquiries(data: InquiriesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Serialize writes through a single in-memory chain so concurrent form
// submissions don't read-modify-write the JSON file and clobber each
// other. Mirrors the pattern in analytics-store.
let writeQueue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(task)
  writeQueue = p.catch(() => undefined)
  return p
}

export async function addInquiry(input: Omit<Inquiry, "id" | "createdAt" | "notes">): Promise<Inquiry> {
  return enqueue(async () => {
    const data = await readInquiries()
    const inquiry: Inquiry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      notes: "",
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    }
    data.inquiries.unshift(inquiry)
    await writeInquiries(data)
    return inquiry
  })
}

export async function deleteInquiry(id: string): Promise<void> {
  await enqueue(async () => {
    const data = await readInquiries()
    data.inquiries = data.inquiries.filter((i) => i.id !== id)
    await writeInquiries(data)
  })
}

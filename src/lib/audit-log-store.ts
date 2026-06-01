// Append-only FIFO log of meaningful admin actions. Keeps the last 500
// entries on disk so the panel has a recent activity trail without
// growing unbounded. Used by server actions via `recordAudit(...)`.

import { promises as fs } from "node:fs"
import path from "node:path"
import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySession } from "./admin-session"

const DATA_FILE = path.join(process.cwd(), "data", "audit-log.json")
const MAX_ENTRIES = 500

export type AuditEntry = {
  id: string
  ts: string // ISO
  user: string // admin username from session (or "system")
  action: string // short identifier, e.g. "blog.delete"
  target?: string // human-friendly id/label of the affected record
  note?: string // optional free-text detail
}

type AuditData = { entries: AuditEntry[] }

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Serialize writes so concurrent server actions don't lose entries.
let writeQueue: Promise<unknown> = Promise.resolve()

async function readData(): Promise<AuditData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AuditData>
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { entries: [] }
    throw err
  }
}

async function writeData(data: AuditData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

async function currentUser(): Promise<string> {
  try {
    const store = await cookies()
    const session = await verifySession(store.get(SESSION_COOKIE)?.value)
    return session?.username ?? "system"
  } catch {
    return "system"
  }
}

export async function recordAudit(
  action: string,
  detail?: { target?: string; note?: string },
): Promise<void> {
  const user = await currentUser()
  const entry: AuditEntry = {
    id: makeId(),
    ts: new Date().toISOString(),
    user,
    action,
    target: detail?.target,
    note: detail?.note,
  }
  const task = writeQueue.then(async () => {
    const data = await readData()
    data.entries.unshift(entry)
    if (data.entries.length > MAX_ENTRIES) {
      data.entries = data.entries.slice(0, MAX_ENTRIES)
    }
    await writeData(data)
  })
  writeQueue = task.catch(() => undefined)
  return task
}

export async function readAuditLog(): Promise<AuditEntry[]> {
  const data = await readData()
  return data.entries
}

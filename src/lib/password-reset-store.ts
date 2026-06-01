// Tracks active password reset requests. Each entry holds an email, a
// hashed 6-digit code, an expiry, and a brute-force counter. Used by
// the /admin/forgot flow. Codes live 15 min; max 5 attempts before
// invalidation. Cleanup happens lazily on every read.

import { promises as fs } from "node:fs"
import path from "node:path"
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const DATA_FILE = path.join(process.cwd(), "data", "password-resets.json")
const TTL_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

export type ResetRequest = {
  id: string
  email: string
  codeHash: string // scrypt("<salt>.<keyHex>")
  expiresAt: string
  attempts: number
  verified: boolean // true once the code is matched
  used: boolean // true once password has been changed
  createdAt: string
}

type ResetData = { requests: ResetRequest[] }

function makeId(): string {
  return randomBytes(12).toString("hex")
}

async function hash(value: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derived = await scryptAsync(value, salt, 64)
  return `${salt}.${derived.toString("hex")}`
}

async function matches(value: string, stored: string): Promise<boolean> {
  const dot = stored.indexOf(".")
  if (dot <= 0) return false
  const salt = stored.slice(0, dot)
  const hex = stored.slice(dot + 1)
  let expected: Buffer
  try {
    expected = Buffer.from(hex, "hex")
  } catch {
    return false
  }
  let derived: Buffer
  try {
    derived = await scryptAsync(value, salt, 64)
  } catch {
    return false
  }
  if (expected.length !== derived.length) return false
  return timingSafeEqual(derived, expected)
}

async function readData(): Promise<ResetData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<ResetData>
    return { requests: Array.isArray(parsed.requests) ? parsed.requests : [] }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { requests: [] }
    throw err
  }
}

async function writeData(data: ResetData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Drop expired/used entries. Keeps the file from growing indefinitely.
function prune(data: ResetData): ResetData {
  const now = Date.now()
  data.requests = data.requests.filter((r) => {
    const exp = new Date(r.expiresAt).getTime()
    if (Number.isNaN(exp)) return false
    return exp > now && !r.used && r.attempts < MAX_ATTEMPTS
  })
  return data
}

// Generates a 6-digit code, stores the hash, returns the plain code so
// the caller can email it. Plain code never lives on disk.
export async function issueResetCode(email: string): Promise<{
  id: string
  code: string
}> {
  const normalized = email.trim().toLowerCase()
  const code = String(Math.floor(100_000 + Math.random() * 900_000))
  const codeHash = await hash(code)
  const id = makeId()
  const now = new Date()
  const entry: ResetRequest = {
    id,
    email: normalized,
    codeHash,
    expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
    attempts: 0,
    verified: false,
    used: false,
    createdAt: now.toISOString(),
  }
  const data = prune(await readData())
  // Invalidate any existing pending requests for this email so only the
  // latest code works.
  data.requests = data.requests.filter((r) => r.email !== normalized)
  data.requests.push(entry)
  await writeData(data)
  return { id, code }
}

export type VerifyResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function verifyResetCode(
  id: string,
  code: string,
): Promise<VerifyResult> {
  const data = prune(await readData())
  const entry = data.requests.find((r) => r.id === id)
  if (!entry) return { ok: false, error: "Geçersiz veya süresi dolmuş istek." }
  if (entry.used) return { ok: false, error: "Bu istek zaten kullanılmış." }
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "Kodun süresi dolmuş, yeni bir kod isteyin." }
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Çok fazla yanlış deneme. Yeni bir kod isteyin." }
  }
  const ok = await matches(code, entry.codeHash)
  entry.attempts += 1
  if (!ok) {
    await writeData(data)
    return { ok: false, error: "Kod hatalı." }
  }
  entry.verified = true
  await writeData(data)
  return { ok: true, id: entry.id }
}

// Final step — consumes a verified reset request. Returns the email so
// the caller can update the actual admin password.
export async function consumeReset(id: string): Promise<string | null> {
  const data = prune(await readData())
  const entry = data.requests.find((r) => r.id === id)
  if (!entry || !entry.verified || entry.used) return null
  if (new Date(entry.expiresAt).getTime() < Date.now()) return null
  entry.used = true
  await writeData(data)
  return entry.email
}

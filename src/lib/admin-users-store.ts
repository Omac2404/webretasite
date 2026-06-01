// Server-only admin user store. Backed by data/admins.json with the
// master admin auto-seeded on first run. Passwords stored as
// scrypt("<salt>.<keyHex>") so even local disk access alone doesn't
// reveal them.

import { promises as fs } from "node:fs"
import path from "node:path"
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import {
  MASTER_ADMIN_EMAIL,
  type AdminUser,
  type AdminUsersData,
} from "./admin-users-types"

const DATA_FILE = path.join(process.cwd(), "data", "admins.json")

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derived = await scryptAsync(plain, salt, 64)
  return `${salt}.${derived.toString("hex")}`
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
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
    derived = await scryptAsync(plain, salt, 64)
  } catch {
    return false
  }
  if (expected.length !== derived.length) return false
  return timingSafeEqual(derived, expected)
}

function normalize(a: Partial<AdminUser>): AdminUser {
  return {
    id: String(a.id ?? makeId()),
    email: String(a.email ?? "").trim().toLowerCase(),
    name: String(a.name ?? ""),
    passwordHash: String(a.passwordHash ?? ""),
    isMaster: Boolean(a.isMaster),
    createdAt: String(a.createdAt ?? new Date().toISOString()),
  }
}

async function readData(): Promise<AdminUsersData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AdminUsersData> & {
      admins?: Array<Partial<AdminUser>>
    }
    return {
      admins: Array.isArray(parsed.admins) ? parsed.admins.map(normalize) : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { admins: [] }
    throw err
  }
}

async function writeData(data: AdminUsersData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Bootstrap the master admin on first read so the system always has an
// account capable of receiving password resets. Initial password is the
// ADMIN_PASSWORD env var (or the existing "123456" dev fallback). The
// master should change it via "Şifremi unuttum" on first real use.
async function ensureMaster(data: AdminUsersData): Promise<AdminUsersData> {
  const hasMaster = data.admins.some(
    (a) => a.email === MASTER_ADMIN_EMAIL || a.isMaster,
  )
  if (hasMaster) return data
  const initial = process.env.ADMIN_PASSWORD ?? "123456"
  const passwordHash = await hashPassword(initial)
  const master: AdminUser = {
    id: makeId(),
    email: MASTER_ADMIN_EMAIL,
    name: "Webreta Admin",
    passwordHash,
    isMaster: true,
    createdAt: new Date().toISOString(),
  }
  data.admins.unshift(master)
  await writeData(data)
  return data
}

export async function listAdmins(): Promise<AdminUser[]> {
  const data = await ensureMaster(await readData())
  return data.admins
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const target = email.trim().toLowerCase()
  if (!target) return null
  const admins = await listAdmins()
  return admins.find((a) => a.email === target) ?? null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function addAdmin(input: {
  email: string
  name: string
  password: string
}): Promise<{ ok: true; admin: AdminUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Geçerli bir e-posta girin." }
  if (input.password.length < 8) {
    return { ok: false, error: "Şifre en az 8 karakter olmalı." }
  }
  const data = await ensureMaster(await readData())
  if (data.admins.some((a) => a.email === email)) {
    return { ok: false, error: "Bu e-posta zaten kayıtlı." }
  }
  const passwordHash = await hashPassword(input.password)
  const admin: AdminUser = {
    id: makeId(),
    email,
    name: input.name.trim() || email.split("@")[0],
    passwordHash,
    isMaster: false,
    createdAt: new Date().toISOString(),
  }
  data.admins.push(admin)
  await writeData(data)
  return { ok: true, admin }
}

export async function removeAdmin(id: string): Promise<{ ok: boolean; error?: string }> {
  const data = await ensureMaster(await readData())
  const target = data.admins.find((a) => a.id === id)
  if (!target) return { ok: false, error: "Admin bulunamadı." }
  if (target.isMaster) {
    return { ok: false, error: "Master admin silinemez." }
  }
  data.admins = data.admins.filter((a) => a.id !== id)
  await writeData(data)
  return { ok: true }
}

export async function setAdminPassword(
  email: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 8) return false
  const data = await ensureMaster(await readData())
  const target = data.admins.find(
    (a) => a.email === email.trim().toLowerCase(),
  )
  if (!target) return false
  target.passwordHash = await hashPassword(newPassword)
  await writeData(data)
  return true
}

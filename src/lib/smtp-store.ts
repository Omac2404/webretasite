// Server-only SMTP ayar store'u. Tek dokümanlık JSON.
// Şifre düz metin olarak diskte tutulur (file-based admin sırrı — sitenin
// diğer alanlarıyla aynı pattern). `readSmtpForAdmin()` şifreyi client'a
// göndermeyen güvenli versiyonu döndürür.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_SMTP,
  type SmtpEncryption,
  type SmtpSettings,
  type SmtpSettingsPublic,
} from "./smtp-types"

const DATA_FILE = path.join(process.cwd(), "data", "smtp.json")

function normalizeEncryption(value: unknown): SmtpEncryption {
  if (value === "ssl" || value === "tls" || value === "none") return value
  return DEFAULT_SMTP.encryption
}

function normalizePort(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return DEFAULT_SMTP.port
  const clamped = Math.floor(n)
  if (clamped < 1 || clamped > 65535) return DEFAULT_SMTP.port
  return clamped
}

function normalize(raw: Partial<SmtpSettings>): SmtpSettings {
  return {
    enabled: Boolean(raw.enabled ?? DEFAULT_SMTP.enabled),
    host: String(raw.host ?? DEFAULT_SMTP.host),
    port: normalizePort(raw.port ?? DEFAULT_SMTP.port),
    auth: Boolean(raw.auth ?? DEFAULT_SMTP.auth),
    username: String(raw.username ?? DEFAULT_SMTP.username),
    password: String(raw.password ?? DEFAULT_SMTP.password),
    encryption: normalizeEncryption(raw.encryption),
    fromEmail: String(raw.fromEmail ?? DEFAULT_SMTP.fromEmail),
    fromName: String(raw.fromName ?? DEFAULT_SMTP.fromName),
    forceFromAddress: Boolean(
      raw.forceFromAddress ?? DEFAULT_SMTP.forceFromAddress,
    ),
    disableTLSVerification: Boolean(
      raw.disableTLSVerification ?? DEFAULT_SMTP.disableTLSVerification,
    ),
  }
}

// Sunucu içi kullanım için tam settings (şifre dahil). Mail gönderim
// kodu çağırır.
export async function readSmtp(): Promise<SmtpSettings> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<SmtpSettings>
    return normalize(parsed)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_SMTP }
    }
    throw err
  }
}

// Admin sayfası için güvenli versiyon — şifre yerine sadece "var/yok"
// bilgisi döner.
export async function readSmtpForAdmin(): Promise<SmtpSettingsPublic> {
  const s = await readSmtp()
  const { password, ...rest } = s
  return { ...rest, hasPassword: password.length > 0 }
}

// Şifre alanı için özel kural: input boş geldiyse mevcut şifre korunur.
// `password === null` "değiştirme" demek; string ise (boş dahil) güncelle.
export async function writeSmtp(
  next: Omit<SmtpSettings, "password"> & { password: string | null },
): Promise<void> {
  const current = await readSmtp()
  const password = next.password === null ? current.password : next.password
  const merged: SmtpSettings = normalize({ ...next, password })
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(merged, null, 2) + "\n",
    "utf8",
  )
}

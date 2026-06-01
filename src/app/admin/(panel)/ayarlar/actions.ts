"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { recordAudit } from "@/lib/audit-log-store"
import { writeSiteSettings, readSiteSettings } from "@/lib/site-settings-store"

const UPLOAD_DIR = path.join(process.cwd(), "public", "brand")
const MAX_BYTES = 1 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/svg+xml",
  "image/webp",
])

export type SaveState = { ok?: boolean; error?: string }

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  if (mime === "image/svg+xml") return "svg"
  if (mime === "image/x-icon" || mime === "image/vnd.microsoft.icon") return "ico"
  return "bin"
}

function revalidateEverywhere(): void {
  // The favicon ships at the root so every public page can pick it up.
  // Revalidating the layout would be ideal but Next doesn't expose that —
  // revalidating /admin/ayarlar plus a couple of high-traffic public
  // entries keeps the cache fresh enough; uncached pages re-read on view.
  revalidatePath("/admin/ayarlar")
  revalidatePath("/", "layout")
}

export async function uploadFaviconAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const file = formData.get("favicon")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Favicon dosyası seçilmedi." }
  }
  if (file.size > MAX_BYTES) {
    return { error: "Favicon 1 MB'dan büyük olamaz." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Sadece ICO, PNG, SVG veya WebP yükleyebilirsin." }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `favicon-${Date.now()}.${extFromMime(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes)

  await writeSiteSettings({ faviconUrl: `/brand/${filename}` })
  await recordAudit("settings.favicon.upload", { target: filename })
  revalidateEverywhere()
  return { ok: true }
}

export async function resetFaviconAction(): Promise<void> {
  await writeSiteSettings({ faviconUrl: "" })
  await recordAudit("settings.favicon.reset")
  revalidateEverywhere()
}

const LOGO_ALLOWED_TYPES = new Set([
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/jpeg",
])
const LOGO_MAX_BYTES = 2 * 1024 * 1024

function logoExt(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  if (mime === "image/svg+xml") return "svg"
  if (mime === "image/jpeg") return "jpg"
  return "bin"
}

export async function uploadLogoAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const file = formData.get("logo")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Logo dosyası seçilmedi." }
  }
  if (file.size > LOGO_MAX_BYTES) {
    return { error: "Logo 2 MB'dan büyük olamaz." }
  }
  if (!LOGO_ALLOWED_TYPES.has(file.type)) {
    return { error: "Sadece PNG, SVG, WebP veya JPG yükleyebilirsin." }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `logo-${Date.now()}.${logoExt(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes)

  await writeSiteSettings({ logoUrl: `/brand/${filename}` })
  await recordAudit("settings.logo.upload", { target: filename })
  revalidateEverywhere()
  return { ok: true }
}

export async function resetLogoAction(): Promise<void> {
  await writeSiteSettings({ logoUrl: "" })
  await recordAudit("settings.logo.reset")
  revalidateEverywhere()
}

const DATA_DIR = path.join(process.cwd(), "data")
const BACKUP_MAX_BYTES = 50 * 1024 * 1024

// Restores the admin's exported backup JSON. The backup shape is
// { exportedAt, data: { "<basename>": <parsed-json> } } — see
// /admin/ayarlar/yedek/route.ts. Each top-level key under `data` is
// written back as data/<key>.json, replacing the live file.
export async function restoreBackupAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const file = formData.get("backup")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Yedek dosyası seçilmedi." }
  }
  if (file.size > BACKUP_MAX_BYTES) {
    return { error: "Yedek dosyası 50 MB'dan büyük olamaz." }
  }

  let parsed: unknown
  try {
    const text = await file.text()
    parsed = JSON.parse(text)
  } catch {
    return { error: "Dosya geçerli bir JSON değil." }
  }

  const root = (parsed ?? {}) as { exportedAt?: unknown; data?: unknown }
  if (typeof root.exportedAt !== "string" || typeof root.data !== "object" || root.data === null) {
    return {
      error: "Yedek dosyasının formatı geçersiz (exportedAt veya data alanı eksik).",
    }
  }

  const data = root.data as Record<string, unknown>
  await fs.mkdir(DATA_DIR, { recursive: true })
  let restored = 0
  for (const [name, value] of Object.entries(data)) {
    // Bare basename only — block "../" injection from a tampered backup.
    if (!/^[a-z0-9_-]+$/i.test(name)) continue
    const target = path.join(DATA_DIR, `${name}.json`)
    await fs.writeFile(target, JSON.stringify(value, null, 2) + "\n", "utf8")
    restored += 1
  }

  if (restored === 0) {
    return { error: "Yedek dosyasında geri yüklenebilir kayıt yok." }
  }

  await recordAudit("backup.restore", {
    target: `${restored} dosya`,
    note: `Yedek tarihi: ${root.exportedAt}`,
  })
  // Settings, sidebar badges, public pages — everything may have changed.
  revalidateEverywhere()
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function setMaintenanceAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const enabled = formData.get("enabled") === "on"
  const message = String(formData.get("message") ?? "").trim().slice(0, 240)
  const current = await readSiteSettings()
  await writeSiteSettings({
    maintenance: { ...current.maintenance, enabled, message },
  })
  await recordAudit(enabled ? "settings.maintenance.on" : "settings.maintenance.off", {
    note: message || undefined,
  })
  revalidateEverywhere()
  return { ok: true }
}

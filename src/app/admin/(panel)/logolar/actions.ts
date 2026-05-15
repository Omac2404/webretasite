"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import {
  addLogo,
  deleteLogo,
  moveLogo,
  setDisplayMode,
  swapLogoRow,
  type LogoDisplayMode,
  type LogoRow,
} from "@/lib/logos-store"

const UPLOAD_DIR = path.join(process.cwd(), "public", "logos")
const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
])

export type AddLogoState = { error?: string; ok?: boolean }

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/webp") return "webp"
  if (mime === "image/svg+xml") return "svg"
  return "bin"
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "logo"
  )
}

function parseRow(value: FormDataEntryValue | null): LogoRow {
  return String(value ?? "") === "b" ? "b" : "a"
}

function revalidateBoth(): void {
  revalidatePath("/admin/logolar")
  revalidatePath("/")
}

export async function addLogoAction(
  _prev: AddLogoState,
  formData: FormData,
): Promise<AddLogoState> {
  const name = String(formData.get("name") ?? "").trim()
  const file = formData.get("image")
  const row = parseRow(formData.get("row"))

  if (!name) return { error: "Firma ismi gerekli." }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Logo görseli gerekli." }
  }
  if (file.size > MAX_BYTES) {
    return { error: "Görsel 4 MB'dan büyük olamaz." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Sadece PNG, JPG, WebP veya SVG yükleyebilirsin." }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `${slugify(name)}-${Date.now()}.${extFromMime(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes)

  await addLogo({ name, imageUrl: `/logos/${filename}`, row })

  revalidateBoth()
  return { ok: true }
}

export async function deleteLogoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteLogo(id)
  revalidateBoth()
}

export async function setModeAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("mode") ?? "")
  const mode: LogoDisplayMode = raw === "logos" ? "logos" : "names"
  await setDisplayMode(mode)
  revalidateBoth()
}

export async function moveLogoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  const direction = String(formData.get("direction") ?? "") as "up" | "down"
  if (!id || (direction !== "up" && direction !== "down")) return
  await moveLogo(id, direction)
  revalidateBoth()
}

export async function swapRowAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await swapLogoRow(id)
  revalidateBoth()
}

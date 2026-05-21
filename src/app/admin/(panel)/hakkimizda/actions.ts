"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { readAbout, writeAbout } from "@/lib/about-store"
import { sanitizeAboutBody } from "@/lib/about-sanitize"
import type { AboutData, AboutRow } from "@/lib/about-types"

export type SaveAboutState = { error?: string; ok?: boolean }

const UPLOAD_DIR = path.join(process.cwd(), "public", "about")
const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
])

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function bodyFromForm(formData: FormData, key: string): string {
  // Body alanlarında \n\n korunmalı, leading/trailing whitespace temizlenir.
  return String(formData.get(key) ?? "").trim()
}

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/webp") return "webp"
  if (mime === "image/svg+xml") return "svg"
  return "bin"
}

async function maybeUploadImage(
  file: FormDataEntryValue | null,
  rowKey: "row1" | "row2",
): Promise<{ url?: string; error?: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return {} // dosya seçilmedi → mevcut imageUrl korunur
  }
  if (file.size > MAX_BYTES) {
    return { error: `Görsel 6 MB'dan büyük olamaz (${rowKey}).` }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: `Sadece PNG, JPG, WebP veya SVG yükleyebilirsin (${rowKey}).`,
    }
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `${rowKey}-${Date.now()}.${extFromMime(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes)
  return { url: `/about/${filename}` }
}

function buildRow(
  formData: FormData,
  rowKey: "row1" | "row2",
  current: AboutRow,
  uploadedUrl: string | undefined,
): AboutRow {
  return {
    kicker: s(formData, `${rowKey}__kicker`),
    title: s(formData, `${rowKey}__title`),
    // Body, RichTextArea'dan HTML olarak gelir — sanitize edip kaydet.
    body: sanitizeAboutBody(bodyFromForm(formData, `${rowKey}__body`)),
    imageUrl: uploadedUrl ?? current.imageUrl,
    imageAlt: s(formData, `${rowKey}__imageAlt`),
    buttonLabel: s(formData, `${rowKey}__buttonLabel`),
    buttonHref: s(formData, `${rowKey}__buttonHref`),
  }
}

export async function saveAboutAction(
  _prev: SaveAboutState,
  formData: FormData,
): Promise<SaveAboutState> {
  const current = await readAbout()

  // Önce görselleri (varsa) diske yaz; hata olursa abort.
  const r1Upload = await maybeUploadImage(formData.get("row1__image"), "row1")
  if (r1Upload.error) return { error: r1Upload.error }
  const r2Upload = await maybeUploadImage(formData.get("row2__image"), "row2")
  if (r2Upload.error) return { error: r2Upload.error }

  const next: AboutData = {
    hero: {
      kicker: s(formData, "hero__kicker"),
      titleLeader: s(formData, "hero__titleLeader"),
      titleHighlight: s(formData, "hero__titleHighlight"),
      titleTrailer: s(formData, "hero__titleTrailer"),
      subtitle: s(formData, "hero__subtitle"),
    },
    row1: buildRow(formData, "row1", current.row1, r1Upload.url),
    row2: buildRow(formData, "row2", current.row2, r2Upload.url),
    cta: {
      title: s(formData, "cta__title"),
      body: s(formData, "cta__body"),
      buttonLabel: s(formData, "cta__buttonLabel"),
      buttonHref: s(formData, "cta__buttonHref"),
    },
  }

  if (!next.row1.title || !next.row2.title) {
    return { error: "Her iki satırın başlığı boş bırakılamaz." }
  }
  if (!next.cta.title || !next.cta.buttonLabel) {
    return { error: "CTA başlığı ve buton metni boş bırakılamaz." }
  }

  await writeAbout(next)
  revalidatePath("/admin/hakkimizda")
  revalidatePath("/hakkimizda")
  return { ok: true }
}

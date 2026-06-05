"use server"

import { revalidatePath } from "next/cache"
import {
  addMediaFile,
  deleteMedia,
  updateMediaAlt,
} from "@/lib/media-store"
import { slugifyFilename, toWebpOrPassthrough } from "@/lib/image-webp"
import { recordAudit } from "@/lib/audit-log-store"

const PAGE = "/admin/gorseller"
const MAX_BYTES = 12 * 1024 * 1024
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
])

export type UploadMediaState = { ok?: boolean; error?: string }

export async function uploadMediaAction(
  _prev: UploadMediaState,
  formData: FormData,
): Promise<UploadMediaState> {
  const file = formData.get("image")
  const nameHint = String(formData.get("name") ?? "").trim()
  const alt = String(formData.get("alt") ?? "").trim()

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Görsel seçilmedi." }
  }
  if (file.size > MAX_BYTES) {
    return { error: "Görsel 12 MB'dan büyük olamaz." }
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Sadece PNG, JPG, WebP veya SVG yükleyebilirsin." }
  }

  const input = Buffer.from(await file.arrayBuffer())
  let processed
  try {
    processed = await toWebpOrPassthrough(input, file.type)
  } catch {
    return { error: "Görsel işlenemedi. Dosya bozuk olabilir." }
  }

  const baseSlug = slugifyFilename(nameHint || file.name)
  const item = await addMediaFile({
    data: processed.data,
    ext: processed.ext,
    baseSlug,
    alt,
    width: processed.width,
    height: processed.height,
    size: processed.size,
    originalName: file.name,
  })

  await recordAudit("media.upload", { target: item.url })
  revalidatePath(PAGE)
  return { ok: true }
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteMedia(id)
  await recordAudit("media.delete", { target: id })
  revalidatePath(PAGE)
}

export async function updateMediaAltAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const alt = String(formData.get("alt") ?? "").trim()
  await updateMediaAlt(id, alt)
  revalidatePath(PAGE)
}

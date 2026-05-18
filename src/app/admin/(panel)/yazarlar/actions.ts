"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import { addAuthor, deleteAuthor, updateAuthor } from "@/lib/authors-store"

const UPLOAD_DIR = path.join(process.cwd(), "public", "authors")
const MAX_BYTES = 3 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
])

export type AuthorState = { ok?: boolean; error?: string }

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/webp") return "webp"
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
      .slice(0, 40) || "yazar"
  )
}

async function savePhoto(
  file: FormDataEntryValue | null,
  nameHint: string,
): Promise<{ url?: string; error?: string }> {
  if (!(file instanceof File) || file.size === 0) return {}
  if (file.size > MAX_BYTES) {
    return { error: "Fotoğraf 3 MB'dan büyük olamaz." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Sadece PNG, JPG veya WebP yükleyebilirsin." }
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `${slugify(nameHint)}-${Date.now()}.${extFromMime(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes)
  return { url: `/authors/${filename}` }
}

function revalidateAll(): void {
  revalidatePath("/admin/yazarlar")
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  revalidatePath("/")
}

export async function addAuthorAction(
  _prev: AuthorState,
  formData: FormData,
): Promise<AuthorState> {
  const name = String(formData.get("name") ?? "").trim()
  const expertise = String(formData.get("expertise") ?? "").trim()
  if (!name) return { error: "İsim zorunlu." }
  if (!expertise) return { error: "Uzmanlık alanı zorunlu." }

  const photo = await savePhoto(formData.get("photo"), name)
  if (photo.error) return { error: photo.error }

  await addAuthor({
    name,
    expertise,
    photo: photo.url ?? "",
  })

  revalidateAll()
  return { ok: true }
}

export async function updateAuthorAction(
  _prev: AuthorState,
  formData: FormData,
): Promise<AuthorState> {
  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const expertise = String(formData.get("expertise") ?? "").trim()
  if (!id) return { error: "Geçersiz yazar." }
  if (!name) return { error: "İsim zorunlu." }
  if (!expertise) return { error: "Uzmanlık alanı zorunlu." }

  const photo = await savePhoto(formData.get("photo"), name)
  if (photo.error) return { error: photo.error }

  await updateAuthor(id, {
    name,
    expertise,
    ...(photo.url ? { photo: photo.url } : {}),
  })

  revalidateAll()
  return { ok: true }
}

export async function deleteAuthorAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteAuthor(id)
  revalidateAll()
}

"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import {
  addPost,
  deletePost,
  togglePublished,
  updatePost,
} from "@/lib/blog-store"
import type { BlogPostSeo, CategoryKey } from "@/lib/blog-types"

function parseSeoFromForm(formData: FormData): Partial<BlogPostSeo> {
  const metaTitle = String(formData.get("seo_metaTitle") ?? "").trim()
  const metaDescription = String(
    formData.get("seo_metaDescription") ?? "",
  ).trim()
  const keywords = String(formData.get("seo_keywords") ?? "")
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 20)
  const focusKeyword = String(formData.get("seo_focusKeyword") ?? "").trim()
  const ogImage = String(formData.get("seo_ogImage") ?? "").trim()
  const noindex = formData.get("seo_noindex") === "on"
  const includeInSitemap = formData.get("seo_includeInSitemap") === "on"
  return {
    metaTitle,
    metaDescription,
    keywords,
    focusKeyword,
    ogImage,
    noindex,
    includeInSitemap,
  }
}

function parseCategory(v: FormDataEntryValue | null): CategoryKey {
  return v === "haberler" ? "haberler" : "teknik"
}

const COVER_DIR = path.join(process.cwd(), "public", "blog")
const INLINE_DIR = path.join(process.cwd(), "public", "blog", "inline")
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
])

export type PostState = { ok?: boolean; error?: string; slug?: string }
export type UploadResult = { url?: string; error?: string }

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/webp") return "webp"
  return "bin"
}

function slugifyFilename(name: string): string {
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
      .slice(0, 40) || "img"
  )
}

async function saveImage(
  file: FormDataEntryValue | null,
  destDir: string,
  slugHint: string,
  publicPrefix: string,
): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) return {}
  if (file.size > MAX_BYTES) {
    return { error: "Görsel 5 MB'dan büyük olamaz." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Sadece PNG, JPG veya WebP yükleyebilirsin." }
  }
  await fs.mkdir(destDir, { recursive: true })
  const filename = `${slugifyFilename(slugHint)}-${Date.now()}.${extFromMime(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(destDir, filename), bytes)
  return { url: `${publicPrefix}/${filename}` }
}

function revalidateAll(): void {
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  revalidatePath("/")
  revalidatePath("/sitemap.xml")
}

// Convert the HTML datetime-local string into an ISO timestamp, or "" if
// blank/invalid. The input is the local browser time; we let the
// browser stash it as "YYYY-MM-DDTHH:mm" and convert via Date.
function normalizePublishAt(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString()
}

export async function addPostAction(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const authorId = String(formData.get("authorId") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const excerpt = String(formData.get("excerpt") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()
  const published = formData.get("published") === "on"
  const publishAt = normalizePublishAt(String(formData.get("publishAt") ?? ""))

  if (!title) return { error: "Başlık zorunlu." }
  if (!content) return { error: "İçerik boş olamaz." }
  if (!authorId) return { error: "Yazar seçmelisin." }

  const cover = await saveImage(
    formData.get("cover"),
    COVER_DIR,
    title,
    "/blog",
  )
  if (cover.error) return { error: cover.error }

  const post = await addPost({
    authorId,
    category: parseCategory(formData.get("category")),
    title,
    excerpt,
    content,
    coverImage: cover.url ?? "",
    published,
    publishAt,
    seo: parseSeoFromForm(formData),
  })

  revalidateAll()
  return { ok: true, slug: post.slug }
}

export async function updatePostAction(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const id = String(formData.get("id") ?? "").trim()
  const authorId = String(formData.get("authorId") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const excerpt = String(formData.get("excerpt") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()
  const published = formData.get("published") === "on"
  const publishAt = normalizePublishAt(String(formData.get("publishAt") ?? ""))

  if (!id) return { error: "Geçersiz yazı." }
  if (!title) return { error: "Başlık zorunlu." }
  if (!content) return { error: "İçerik boş olamaz." }
  if (!authorId) return { error: "Yazar seçmelisin." }

  const cover = await saveImage(
    formData.get("cover"),
    COVER_DIR,
    title,
    "/blog",
  )
  if (cover.error) return { error: cover.error }

  await updatePost(id, {
    authorId,
    category: parseCategory(formData.get("category")),
    title,
    excerpt,
    content,
    // Only overwrite cover if a new file was uploaded; otherwise the
    // existing cover (read by the page) is preserved.
    ...(cover.url ? { coverImage: cover.url } : {}),
    published,
    publishAt,
    seo: parseSeoFromForm(formData),
  })

  revalidateAll()
  return { ok: true }
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deletePost(id)
  revalidateAll()
}

export async function togglePublishedAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await togglePublished(id)
  revalidateAll()
}

// Inline content image upload. Returns the public URL so the client can
// splice a `![](url)` snippet into the content textarea. Called directly
// from the admin form (not via a form action) — server actions can be
// invoked as regular async functions in modern Next.js.
export async function uploadInlineImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const result = await saveImage(
    formData.get("file"),
    INLINE_DIR,
    String(formData.get("hint") ?? "icerik"),
    "/blog/inline",
  )
  return result
}

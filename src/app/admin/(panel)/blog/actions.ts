"use server"

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

export type PostState = { ok?: boolean; error?: string; slug?: string }

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

  // Cover comes from the media library (picker writes the public URL).
  const coverImage = String(formData.get("coverUrl") ?? "").trim()

  const post = await addPost({
    authorId,
    category: parseCategory(formData.get("category")),
    title,
    excerpt,
    content,
    coverImage,
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

  // The picker is seeded with the current cover, so coverUrl always carries
  // the desired final value — including "" when the cover was removed.
  const coverImage = String(formData.get("coverUrl") ?? "").trim()

  await updatePost(id, {
    authorId,
    category: parseCategory(formData.get("category")),
    title,
    excerpt,
    content,
    coverImage,
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

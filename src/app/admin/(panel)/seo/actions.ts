"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import {
  updateGlobalSeo,
  updatePageSeo,
  updateSitemapSettings,
} from "@/lib/seo-store"
import { setPostSitemapInclusion } from "@/lib/blog-store"
import {
  CHANGE_FREQS,
  SEO_MANAGED_PAGES,
  type ChangeFreq,
} from "@/lib/seo-types"

export type SaveState = { ok?: boolean; error?: string }

// Default OG image upload. Saves into /public/og and returns the public
// path; the caller (OgImageField) drops it into the global form's
// defaultOgImage input so the regular "Kaydet" persists it to seo.json.
const OG_UPLOAD_DIR = path.join(process.cwd(), "public", "og")
const OG_MAX_BYTES = 4 * 1024 * 1024
const OG_ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"])

export type UploadState = { ok?: boolean; path?: string; error?: string }

export async function uploadOgImageAction(
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("image")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Görsel seçilmedi." }
  }
  if (file.size > OG_MAX_BYTES) {
    return { error: "Görsel 4 MB'dan büyük olamaz." }
  }
  if (!OG_ALLOWED.has(file.type)) {
    return { error: "Sadece PNG, JPG veya WebP yükleyebilirsin." }
  }
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  await fs.mkdir(OG_UPLOAD_DIR, { recursive: true })
  const filename = `og-${Date.now()}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(OG_UPLOAD_DIR, filename), bytes)
  return { ok: true, path: `/og/${filename}` }
}

function parseKeywords(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 20)
}

export async function saveGlobalSeoAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const siteName = String(formData.get("siteName") ?? "").trim()
  const siteUrl = String(formData.get("siteUrl") ?? "").trim()
  const defaultTitle = String(formData.get("defaultTitle") ?? "").trim()
  const titleTemplate = String(formData.get("titleTemplate") ?? "").trim()
  const defaultDescription = String(
    formData.get("defaultDescription") ?? "",
  ).trim()
  const defaultKeywords = parseKeywords(
    String(formData.get("defaultKeywords") ?? ""),
  )
  const defaultOgImage = String(formData.get("defaultOgImage") ?? "").trim()
  const twitterHandle = String(formData.get("twitterHandle") ?? "").trim()

  if (siteUrl && !/^https?:\/\//i.test(siteUrl)) {
    return { error: "Site URL https:// veya http:// ile başlamalı." }
  }

  await updateGlobalSeo({
    siteName,
    siteUrl,
    defaultTitle,
    titleTemplate,
    defaultDescription,
    defaultKeywords,
    defaultOgImage,
    twitterHandle,
  })
  revalidatePath("/", "layout")
  revalidatePath("/admin/seo")
  return { ok: true }
}

export async function savePageSeoAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const href = String(formData.get("href") ?? "").trim()
  if (!SEO_MANAGED_PAGES.some((p) => p.href === href)) {
    return { error: "Geçersiz sayfa." }
  }
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const keywords = parseKeywords(String(formData.get("keywords") ?? ""))
  const ogImage = String(formData.get("ogImage") ?? "").trim()
  const noindex = formData.get("noindex") === "on"
  const includeInSitemap = formData.get("includeInSitemap") === "on"
  const priorityRaw = Number(formData.get("priority") ?? 0.7)
  const priority = Number.isFinite(priorityRaw)
    ? Math.min(1, Math.max(0, priorityRaw))
    : 0.7
  const changefreqRaw = String(formData.get("changefreq") ?? "weekly")
  const changefreq: ChangeFreq = (CHANGE_FREQS as string[]).includes(
    changefreqRaw,
  )
    ? (changefreqRaw as ChangeFreq)
    : "weekly"

  await updatePageSeo(href, {
    title,
    description,
    keywords,
    ogImage,
    noindex,
    includeInSitemap,
    priority,
    changefreq,
  })
  revalidatePath(href)
  revalidatePath("/admin/seo")
  revalidatePath("/sitemap.xml")
  return { ok: true }
}

export async function saveSitemapSettingsAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const includeLegalPages = formData.get("includeLegalPages") === "on"
  const extraUrls = String(formData.get("extraUrls") ?? "")
    .split(/\n/)
    .map((u) => u.trim())
    .filter((u) => u.length > 0)
    .slice(0, 50)

  await updateSitemapSettings({ includeLegalPages, extraUrls })
  revalidatePath("/admin/seo")
  revalidatePath("/sitemap.xml")
  revalidatePath("/robots.txt")
  return { ok: true }
}

// Toggle a single blog post's sitemap inclusion from the SEO panel's blog
// overview. `include` is the desired next state ("on" = in sitemap).
export async function toggleBlogSitemapAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const include = formData.get("include") === "on"
  await setPostSitemapInclusion(id, include)
  revalidatePath("/admin/seo")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/blog`)
}

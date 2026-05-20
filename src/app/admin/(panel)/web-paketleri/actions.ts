"use server"

import { promises as fs } from "node:fs"
import path from "node:path"
import { revalidatePath } from "next/cache"
import {
  MAX_KOBI_BULLETS,
  MAX_KOBI_TAGS,
  MAX_WEB_PACKAGE_BULLETS,
  WEB_PACKAGE_ICON_KEYS,
  readWebPackages,
  updateKobiBanner,
  updateWizardHeading,
  writeWebPackages,
  type WebPackage,
  type WebPackageIconKey,
  type WebPackagesData,
} from "@/lib/web-packages-store"

export type SaveState = { ok?: boolean; error?: string }

function isIconKey(v: string): v is WebPackageIconKey {
  return (WEB_PACKAGE_ICON_KEYS as string[]).includes(v)
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "paket"
  )
}

// Bulk save — admin edits all packages on one screen; we replace the
// entire list on submit. Order is preserved from the form.
export async function saveWebPackagesAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const ids = formData.getAll("pkg_id").map((v) => String(v))
  if (ids.length === 0) {
    return { error: "En az bir paket girilmeli." }
  }

  const packages: WebPackage[] = []
  for (let i = 0; i < ids.length; i++) {
    const label = String(formData.get(`label_${i}`) ?? "").trim()
    if (!label) {
      return { error: `Paket ${i + 1}: başlık boş bırakılamaz.` }
    }
    const tagline = String(formData.get(`tagline_${i}`) ?? "").trim()
    const descriptor = String(formData.get(`descriptor_${i}`) ?? "").trim()
    const desc = String(formData.get(`desc_${i}`) ?? "").trim()
    const iconKeyRaw = String(formData.get(`iconKey_${i}`) ?? "layers")
    const iconKey: WebPackageIconKey = isIconKey(iconKeyRaw) ? iconKeyRaw : "layers"
    const kobiRedirect = formData.get(`kobi_${i}`) === "on"
    const bulletsRaw = formData
      .getAll(`bullets_${i}`)
      .map((b) => String(b).trim())
      .filter((b) => b.length > 0)
    const bullets = bulletsRaw.slice(0, MAX_WEB_PACKAGE_BULLETS)
    const rawId = String(formData.get(`pkg_id`) ?? "")
    const id = ids[i] && ids[i].trim() ? ids[i] : slugify(label)

    packages.push({
      id,
      label,
      tagline,
      descriptor,
      desc,
      bullets,
      iconKey,
      kobiRedirect,
    })
    // unused but TypeScript narrowing happy
    void rawId
  }

  const data: WebPackagesData = { packages }
  await writeWebPackages(data)
  revalidatePath("/admin/web-paketleri")
  revalidatePath("/web-site")
  return { ok: true }
}

export async function _readForAdmin(): Promise<WebPackagesData> {
  return readWebPackages()
}

const KOBI_UPLOAD_DIR = path.join(process.cwd(), "public", "brand")
const KOBI_MAX_BYTES = 4 * 1024 * 1024
const KOBI_ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
])

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/webp") return "webp"
  if (mime === "image/svg+xml") return "svg"
  return "bin"
}

export async function saveKobiBannerAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const eyebrow = String(formData.get("eyebrow") ?? "").trim()
  const bigTitle = String(formData.get("bigTitle") ?? "").trim()
  const bigSubtitle = String(formData.get("bigSubtitle") ?? "").trim()
  const rightEyebrow = String(formData.get("rightEyebrow") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim()
  const ctaHref = String(formData.get("ctaHref") ?? "").trim()
  const tags = formData
    .getAll("tags")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0)
    .slice(0, MAX_KOBI_TAGS)
  const bullets = formData
    .getAll("bullets")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0)
    .slice(0, MAX_KOBI_BULLETS)
  const removeImage = formData.get("removeImage") === "on"

  // Optional image upload. New file replaces the existing imageUrl;
  // "removeImage" flag clears it back to the gradient.
  let imageUrl: string | undefined
  const file = formData.get("image")
  if (file instanceof File && file.size > 0) {
    if (file.size > KOBI_MAX_BYTES) {
      return { error: "Görsel 4 MB'dan büyük olamaz." }
    }
    if (!KOBI_ALLOWED.has(file.type)) {
      return { error: "Sadece PNG, JPG, WebP veya SVG yükleyebilirsin." }
    }
    await fs.mkdir(KOBI_UPLOAD_DIR, { recursive: true })
    const filename = `kobi-banner-${Date.now()}.${extFromMime(file.type)}`
    const bytes = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(KOBI_UPLOAD_DIR, filename), bytes)
    imageUrl = `/brand/${filename}`
  } else if (removeImage) {
    imageUrl = ""
  }

  await updateKobiBanner({
    eyebrow,
    bigTitle,
    bigSubtitle,
    rightEyebrow,
    title,
    description,
    ctaLabel,
    ctaHref,
    tags,
    bullets,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  })

  revalidatePath("/admin/web-paketleri")
  revalidatePath("/web-site")
  return { ok: true }
}

export async function saveWizardHeadingAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const titleLeader = String(formData.get("titleLeader") ?? "").trim()
  const titleHighlight = String(formData.get("titleHighlight") ?? "").trim()
  const subtitle = String(formData.get("subtitle") ?? "").trim()
  if (!titleLeader && !titleHighlight) {
    return { error: "Başlık için en az bir parça gerekli." }
  }
  await updateWizardHeading({ titleLeader, titleHighlight, subtitle })
  revalidatePath("/admin/web-paketleri")
  revalidatePath("/web-site")
  return { ok: true }
}

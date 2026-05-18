"use server"

import { revalidatePath } from "next/cache"
import { writeFooter } from "@/lib/footer-store"
import {
  SOCIAL_PLATFORMS,
  type FooterConfig,
  type SocialPlatform,
} from "@/lib/footer-types"

export type FooterFormState = { error?: string; ok?: boolean }

function readSocials(formData: FormData): Record<SocialPlatform, string> {
  const out = {} as Record<SocialPlatform, string>
  for (const { key } of SOCIAL_PLATFORMS) {
    out[key] = String(formData.get(`social__${key}`) ?? "").trim()
  }
  return out
}

// Each navHref / legalPageId arrives as its own form entry with the
// same name — getAll preserves the order the browser sent (which the
// admin set with the move-up/move-down arrows in the form).
function readList(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
}

export async function saveFooterAction(
  _prev: FooterFormState,
  formData: FormData,
): Promise<FooterFormState> {
  const titleLeading = String(formData.get("titleLeading") ?? "").trim()
  const titleHighlight = String(formData.get("titleHighlight") ?? "").trim()
  const titleTrailing = String(formData.get("titleTrailing") ?? "").trim()
  const subtitle = String(formData.get("subtitle") ?? "").trim()
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim()
  const ctaHref = String(formData.get("ctaHref") ?? "").trim()
  const copyright = String(formData.get("copyright") ?? "").trim()
  const email = String(formData.get("contact_email") ?? "").trim()
  const phone = String(formData.get("contact_phone") ?? "").trim()
  const address = String(formData.get("contact_address") ?? "").trim()

  if (!titleHighlight) {
    return { error: "Başlığın vurgu kısmı boş bırakılamaz." }
  }
  if (!ctaLabel) return { error: "Buton metni gerekli." }
  if (!ctaHref) return { error: "Buton linki gerekli." }
  if (!copyright) return { error: "Copyright satırı boş bırakılamaz." }

  const config: FooterConfig = {
    titleLeading,
    titleHighlight,
    titleTrailing,
    subtitle,
    ctaLabel,
    ctaHref,
    copyright,
    contact: { email, phone, address },
    socials: readSocials(formData),
    navHrefs: readList(formData, "navHrefs"),
    legalPageIds: readList(formData, "legalPageIds"),
  }

  await writeFooter(config)
  revalidatePath("/admin/footer")
  revalidatePath("/")
  // Every public page renders SiteFooter, so blow the whole layout cache.
  revalidatePath("/", "layout")
  return { ok: true }
}

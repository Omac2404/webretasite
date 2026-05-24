"use server"

import { revalidatePath } from "next/cache"
import {
  CHANNEL_ORDER,
  PACKAGE_ORDER,
  updateChannel,
  updateGlobalCta,
  updatePackage,
  updateWhatsApp,
  type ChannelKey,
  type PackageKey,
} from "@/lib/packages-store"

export type UpdateState = { ok?: boolean; error?: string }

function parseChannel(v: FormDataEntryValue | null): ChannelKey | null {
  const s = String(v ?? "")
  return (CHANNEL_ORDER as readonly string[]).includes(s)
    ? (s as ChannelKey)
    : null
}

function parsePackage(v: FormDataEntryValue | null): PackageKey | null {
  const s = String(v ?? "")
  return (PACKAGE_ORDER as readonly string[]).includes(s)
    ? (s as PackageKey)
    : null
}

function parseList(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((v) => String(v))
}

function revalidateBoth(): void {
  revalidatePath("/admin/paketler")
  revalidatePath("/dijital-reklamlar")
}

export async function updateChannelAction(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const channel = parseChannel(formData.get("channel"))
  if (!channel) return { error: "Geçersiz kanal." }
  const label = String(formData.get("label") ?? "").trim()
  const pageTitle = String(formData.get("pageTitle") ?? "").trim()
  const short = String(formData.get("short") ?? "").trim()
  const intro = String(formData.get("intro") ?? "").trim()
  if (!label || !intro) {
    return { error: "Kanal adı ve açıklama zorunlu." }
  }
  await updateChannel(channel, { label, pageTitle, short, intro })
  revalidateBoth()
  return { ok: true }
}

export async function updatePackageAction(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const channel = parseChannel(formData.get("channel"))
  const pkg = parsePackage(formData.get("package"))
  if (!channel || !pkg) return { error: "Geçersiz kanal/paket." }

  const name = String(formData.get("name") ?? "").trim()
  const tagline = String(formData.get("tagline") ?? "").trim()
  const price = String(formData.get("price") ?? "").trim()
  if (!name || !tagline || !price) {
    return { error: "Ad, açıklama ve fiyat zorunlu." }
  }
  const audience = parseList(formData, "audience")
  const items = parseList(formData, "items")
  const whatsappMessage = String(formData.get("whatsappMessage") ?? "").trim()
  await updatePackage(channel, pkg, {
    name,
    tagline,
    price,
    audience,
    items,
    whatsappMessage,
  })
  revalidateBoth()
  return { ok: true }
}

export async function updateWhatsAppAction(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const number = String(formData.get("number") ?? "").trim()
  const display = String(formData.get("display") ?? "").trim()
  if (!number || !display) {
    return { error: "Numara ve görünür format zorunlu." }
  }
  await updateWhatsApp({ number, display })
  revalidateBoth()
  return { ok: true }
}

export async function updateGlobalCtaAction(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const kicker = String(formData.get("kicker") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  const buttonLabel = String(formData.get("buttonLabel") ?? "").trim()
  const buttonHref = String(formData.get("buttonHref") ?? "").trim()
  if (!title || !body || !buttonLabel) {
    return { error: "Başlık, açıklama ve buton metni boş bırakılamaz." }
  }
  await updateGlobalCta({ kicker, title, body, buttonLabel, buttonHref })
  revalidateBoth()
  return { ok: true }
}

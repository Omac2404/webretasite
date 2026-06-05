"use server"

import { revalidatePath } from "next/cache"
import {
  addRedirect,
  deleteRedirect,
  importRedirects,
  toggleRedirect,
  updateRedirect,
  type MatchType,
} from "@/lib/redirects-store"
import { clearNotFoundLog, removeNotFound } from "@/lib/notfound-log-store"
import { recordAudit } from "@/lib/audit-log-store"

const PAGE = "/admin/yonlendirmeler"

function parseType(value: FormDataEntryValue | null): MatchType {
  const v = String(value ?? "")
  return v === "prefix" || v === "regex" ? v : "exact"
}

// Source must be a root-relative path for exact/prefix; for regex it's a
// pattern so we only require it to be non-empty. Destination may be a
// root-relative path or an absolute http(s) URL.
function validate(
  source: string,
  destination: string,
  matchType: MatchType,
): string | null {
  if (!source) return "Kaynak adres gerekli."
  if (!destination) return "Hedef adres gerekli."
  if (matchType !== "regex" && !source.startsWith("/")) {
    return "Kaynak adres / ile başlamalı (örn. /eski-sayfa)."
  }
  if (!destination.startsWith("/") && !/^https?:\/\//i.test(destination)) {
    return "Hedef / ile başlamalı veya tam bir http(s) adresi olmalı."
  }
  if (matchType === "regex") {
    try {
      new RegExp(source)
    } catch {
      return "Geçersiz regex deseni."
    }
  }
  if (matchType !== "regex" && source === destination) {
    return "Kaynak ve hedef aynı olamaz (döngü)."
  }
  return null
}

export type RedirectFormState = { error?: string; ok?: boolean }

export async function addRedirectAction(
  _prev: RedirectFormState,
  formData: FormData,
): Promise<RedirectFormState> {
  const source = String(formData.get("source") ?? "").trim()
  const destination = String(formData.get("destination") ?? "").trim()
  const matchType = parseType(formData.get("matchType"))
  const permanent = formData.get("permanent") !== null
  const preserveQuery = formData.get("preserveQuery") !== null

  const error = validate(source, destination, matchType)
  if (error) return { error }

  await addRedirect({ source, destination, matchType, permanent, preserveQuery })
  await recordAudit("redirect.add", { target: source, note: `→ ${destination}` })
  revalidatePath(PAGE)
  return { ok: true }
}

export async function updateRedirectAction(
  _prev: RedirectFormState,
  formData: FormData,
): Promise<RedirectFormState> {
  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Kayıt bulunamadı." }
  const source = String(formData.get("source") ?? "").trim()
  const destination = String(formData.get("destination") ?? "").trim()
  const matchType = parseType(formData.get("matchType"))
  const permanent = formData.get("permanent") !== null
  const preserveQuery = formData.get("preserveQuery") !== null

  const error = validate(source, destination, matchType)
  if (error) return { error }

  await updateRedirect(id, { source, destination, matchType, permanent, preserveQuery })
  await recordAudit("redirect.update", { target: source, note: `→ ${destination}` })
  revalidatePath(PAGE)
  return { ok: true }
}

export async function toggleRedirectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await toggleRedirect(id)
  revalidatePath(PAGE)
}

export async function deleteRedirectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteRedirect(id)
  await recordAudit("redirect.delete", { target: id })
  revalidatePath(PAGE)
}

// Bulk paste: one rule per line, "source,destination" or "source<TAB>dest".
// Lines starting with # and blank lines are ignored. All imported as
// exact/permanent rules — the common case for a 1:1 migration map.
export async function bulkImportAction(
  _prev: RedirectFormState & { added?: number; skipped?: number },
  formData: FormData,
): Promise<RedirectFormState & { added?: number; skipped?: number }> {
  const raw = String(formData.get("rows") ?? "")
  const lines: Array<{ source: string; destination: string }> = []
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const parts = trimmed.split(/\t|,|\s+->\s+|\s{2,}/).map((p) => p.trim())
    const [source, destination] = parts
    if (source && destination) lines.push({ source, destination })
  }
  if (lines.length === 0) {
    return { error: "Geçerli satır bulunamadı. Biçim: /eski,/yeni" }
  }
  const { added, skipped } = await importRedirects(lines)
  await recordAudit("redirect.import", { note: `${added} eklendi, ${skipped} atlandı` })
  revalidatePath(PAGE)
  return { ok: true, added, skipped }
}

// From the "haritalanmamış 404'ler" list: create an exact permanent
// redirect for the path and drop it from the 404 log in one go.
export async function mapNotFoundAction(
  _prev: RedirectFormState,
  formData: FormData,
): Promise<RedirectFormState> {
  const source = String(formData.get("source") ?? "").trim()
  const destination = String(formData.get("destination") ?? "").trim()

  const error = validate(source, destination, "exact")
  if (error) return { error }

  await addRedirect({
    source,
    destination,
    matchType: "exact",
    permanent: true,
    preserveQuery: false,
  })
  await removeNotFound(source)
  await recordAudit("redirect.add", { target: source, note: `404→ ${destination}` })
  revalidatePath(PAGE)
  return { ok: true }
}

export async function dismissNotFoundAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") ?? "")
  if (!path) return
  await removeNotFound(path)
  revalidatePath(PAGE)
}

export async function clearNotFoundAction(): Promise<void> {
  await clearNotFoundLog()
  revalidatePath(PAGE)
}

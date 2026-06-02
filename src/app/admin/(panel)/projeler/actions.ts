"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  addProject,
  deleteProject,
  setProjectsOrder,
  updateProject,
  updateProjectsSidebar,
} from "@/lib/projects-store"
import type { ProjectCategory } from "@/lib/projects-types"

export type AddProjectState = { error?: string; ok?: boolean }
export type EditProjectState = { error?: string; ok?: boolean }
export type SidebarState = { ok?: boolean; error?: string }

export async function saveProjectsSidebarAction(
  _prev: SidebarState,
  formData: FormData,
): Promise<SidebarState> {
  const titleLeading = String(formData.get("titleLeading") ?? "").trim()
  const titleHighlight = String(formData.get("titleHighlight") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim()
  const ctaHref = String(formData.get("ctaHref") ?? "").trim()
  if (!titleLeading && !titleHighlight) {
    return { error: "Başlık için en az bir parça gerekli." }
  }
  await updateProjectsSidebar({
    titleLeading,
    titleHighlight,
    description,
    ctaLabel,
    ctaHref,
  })
  revalidatePath("/admin/projeler")
  revalidatePath("/")
  return { ok: true }
}

function parseCategory(v: FormDataEntryValue | null): ProjectCategory {
  return String(v ?? "") === "ops" ? "ops" : "dev"
}

// Validate the YYYY-MM-DD shape the <input type="date"> gives us. We
// accept the empty string upstream (callers decide if required) and
// otherwise enforce the format so the renderer's formatPublishDate
// helper can rely on it.
function isValidIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(v)
  return !Number.isNaN(d.getTime())
}

type ProjectInput = {
  companyId: string
  category: ProjectCategory
  type: string
  publishDate: string
  demand: string
  solution: string
  demandDetail: string
  solutionDetail: string
  siteUrl: string
}

// Normalize the optional "Projeyi gör" link. Empty stays empty (the link
// is simply hidden). A bare domain like "acme.com" gets an https:// prefix
// so the anchor resolves to an absolute URL instead of a same-site path.
function normalizeSiteUrl(raw: string): string {
  const v = raw.trim()
  if (!v) return ""
  if (/^https?:\/\//i.test(v)) return v
  return `https://${v}`
}

function readInput(formData: FormData): ProjectInput | string {
  const companyId = String(formData.get("companyId") ?? "").trim()
  const type = String(formData.get("type") ?? "").trim()
  const publishDate = String(formData.get("publishDate") ?? "").trim()
  const category = parseCategory(formData.get("category"))
  const demand = String(formData.get("demand") ?? "").trim()
  const solution = String(formData.get("solution") ?? "").trim()
  const demandDetail = String(formData.get("demandDetail") ?? "").trim()
  const solutionDetail = String(formData.get("solutionDetail") ?? "").trim()
  const siteUrl = normalizeSiteUrl(String(formData.get("siteUrl") ?? ""))

  if (!companyId) return "Firma seçimi gerekli."
  if (!type) return "Proje tipi gerekli (ör. Web Sitesi, E-Ticaret)."
  if (!publishDate) return "Yayın tarihi gerekli."
  if (!isValidIsoDate(publishDate)) return "Yayın tarihi geçerli değil."
  if (!demand) return "Kısa talep metni gerekli."
  if (!solution) return "Kısa çözüm metni gerekli."
  if (!demandDetail) return "Detaylı talep metni gerekli."
  if (!solutionDetail) return "Detaylı çözüm metni gerekli."

  return {
    companyId,
    category,
    type,
    publishDate,
    demand,
    solution,
    demandDetail,
    solutionDetail,
    siteUrl,
  }
}

function revalidateBoth(): void {
  revalidatePath("/admin/projeler")
  revalidatePath("/")
}

export async function addProjectAction(
  _prev: AddProjectState,
  formData: FormData,
): Promise<AddProjectState> {
  const parsed = readInput(formData)
  if (typeof parsed === "string") return { error: parsed }
  await addProject(parsed)
  revalidateBoth()
  return { ok: true }
}

export async function updateProjectAction(
  _prev: EditProjectState,
  formData: FormData,
): Promise<EditProjectState> {
  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Proje kimliği eksik." }
  const parsed = readInput(formData)
  if (typeof parsed === "string") return { error: parsed }
  await updateProject(id, parsed)
  revalidateBoth()
  redirect("/admin/projeler")
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteProject(id)
  revalidateBoth()
}

// Called by the client-side drag-and-drop list after a drop. Receives
// the full ordered ID array as a plain argument so the client doesn't
// have to construct a FormData payload.
export async function reorderProjectsAction(ids: string[]): Promise<void> {
  if (!Array.isArray(ids)) return
  await setProjectsOrder(ids.map(String).filter(Boolean))
  revalidateBoth()
}

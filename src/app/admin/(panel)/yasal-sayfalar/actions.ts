"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  addLegalPage,
  deleteLegalPage,
  updateLegalPage,
} from "@/lib/legal-store"

export type AddLegalState = { error?: string; ok?: boolean }
export type EditLegalState = { error?: string; ok?: boolean }

function readInput(formData: FormData):
  | { title: string; body: string }
  | string {
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title) return "Sayfa başlığı gerekli."
  if (!body) return "Sayfa metni boş bırakılamaz."
  return { title, body }
}

function revalidateAll(): void {
  revalidatePath("/admin/yasal-sayfalar")
  revalidatePath("/admin/footer")
  revalidatePath("/")
  revalidatePath("/yasal", "layout")
}

export async function addLegalPageAction(
  _prev: AddLegalState,
  formData: FormData,
): Promise<AddLegalState> {
  const parsed = readInput(formData)
  if (typeof parsed === "string") return { error: parsed }
  await addLegalPage(parsed)
  revalidateAll()
  return { ok: true }
}

export async function updateLegalPageAction(
  _prev: EditLegalState,
  formData: FormData,
): Promise<EditLegalState> {
  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Sayfa kimliği eksik." }
  const parsed = readInput(formData)
  if (typeof parsed === "string") return { error: parsed }
  await updateLegalPage(id, parsed)
  revalidateAll()
  redirect("/admin/yasal-sayfalar")
}

export async function deleteLegalPageAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteLegalPage(id)
  revalidateAll()
}

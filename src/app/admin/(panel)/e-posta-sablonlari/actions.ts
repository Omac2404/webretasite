"use server"

import { revalidatePath } from "next/cache"
import { writeTemplates } from "@/lib/email-templates-store"
import {
  TEMPLATE_META,
  type EmailTemplates,
} from "@/lib/email-templates-types"
import { writeFormSuccess } from "@/lib/form-success-store"
import {
  FORM_SUCCESS_META,
  type FormSuccessScreens,
} from "@/lib/form-success-types"

export type TemplatesFormState = { error?: string; ok?: boolean }
export type SuccessScreensFormState = { error?: string; ok?: boolean }

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

export async function saveTemplatesAction(
  _prev: TemplatesFormState,
  formData: FormData,
): Promise<TemplatesFormState> {
  const next = {} as EmailTemplates
  for (const meta of TEMPLATE_META) {
    const subject = s(formData, `${meta.key}__subject`)
    const body = String(formData.get(`${meta.key}__body`) ?? "")
    if (!subject) return { error: `"${meta.label}" konusu boş bırakılamaz.` }
    if (!body.trim()) return { error: `"${meta.label}" gövdesi boş bırakılamaz.` }
    next[meta.key] = { subject, body }
  }
  await writeTemplates(next)
  revalidatePath("/admin/e-posta-sablonlari")
  return { ok: true }
}

export async function saveSuccessScreensAction(
  _prev: SuccessScreensFormState,
  formData: FormData,
): Promise<SuccessScreensFormState> {
  const next = {} as FormSuccessScreens
  for (const meta of FORM_SUCCESS_META) {
    const title = s(formData, `${meta.key}__title`)
    const body = String(formData.get(`${meta.key}__body`) ?? "")
    const ctaLabel = s(formData, `${meta.key}__ctaLabel`)
    if (!title) return { error: `"${meta.label}" başlığı boş bırakılamaz.` }
    if (!body.trim()) return { error: `"${meta.label}" gövdesi boş bırakılamaz.` }
    if (!ctaLabel) return { error: `"${meta.label}" buton metni boş bırakılamaz.` }
    next[meta.key] = { title, body, ctaLabel }
  }
  await writeFormSuccess(next)
  revalidatePath("/admin/e-posta-sablonlari")
  return { ok: true }
}

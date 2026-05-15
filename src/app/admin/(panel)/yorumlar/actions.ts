"use server"

import { revalidatePath } from "next/cache"
import {
  addManualReview,
  deleteReview,
  setMinStars,
  setPublishOverride,
  setReviewSource,
  type ReviewSource,
} from "@/lib/reviews-store"

export type AddManualState = { error?: string; ok?: boolean }

function revalidateBoth(): void {
  revalidatePath("/admin/yorumlar")
  revalidatePath("/")
}

export async function setSourceAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("source") ?? "")
  const source: ReviewSource = raw === "real" ? "real" : "preset"
  await setReviewSource(source)
  revalidateBoth()
}

export async function setMinStarsAction(formData: FormData): Promise<void> {
  const raw = Number(formData.get("minStars") ?? 0)
  await setMinStars(raw)
  revalidateBoth()
}

export async function setOverrideAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  const raw = String(formData.get("value") ?? "")
  if (!id) return
  const value =
    raw === "true" ? true : raw === "false" ? false : raw === "null" ? null : null
  await setPublishOverride(id, value)
  revalidateBoth()
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteReview(id)
  revalidateBoth()
}

export async function addManualReviewAction(
  _prev: AddManualState,
  formData: FormData,
): Promise<AddManualState> {
  const author = String(formData.get("author") ?? "").trim()
  const text = String(formData.get("text") ?? "").trim()
  const rating = Number(formData.get("rating") ?? 0)
  const date = String(formData.get("date") ?? "").trim()

  if (!author) return { error: "İsim gerekli." }
  if (!text) return { error: "Yorum metni gerekli." }
  if (text.length < 10) return { error: "Yorum çok kısa (en az 10 karakter)." }
  if (rating < 1 || rating > 5) return { error: "Yıldız 1-5 arasında olmalı." }

  await addManualReview({ author, text, rating, date })
  revalidateBoth()
  return { ok: true }
}

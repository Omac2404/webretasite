"use server"

import { revalidatePath } from "next/cache"
import {
  addManualReview,
  deleteReview,
  setMinStars,
  setPublishOverride,
  setSummary,
} from "@/lib/reviews-store"

export type AddManualState = { error?: string; ok?: boolean }
export type SummaryState = { error?: string; ok?: boolean }

function revalidateBoth(): void {
  revalidatePath("/admin/yorumlar")
  revalidatePath("/")
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

export async function saveSummaryAction(
  _prev: SummaryState,
  formData: FormData,
): Promise<SummaryState> {
  const rating = Number(formData.get("rating") ?? 0)
  const reviewCount = Number(formData.get("reviewCount") ?? 0)
  const businessName = String(formData.get("businessName") ?? "").trim()
  const reviewsUrl = String(formData.get("reviewsUrl") ?? "").trim()

  if (!businessName) return { error: "Firma adı boş bırakılamaz." }
  if (rating < 0 || rating > 5) return { error: "Puan 0 ile 5 arasında olmalı." }
  if (reviewCount < 0) return { error: "Yorum sayısı negatif olamaz." }
  if (reviewsUrl && !/^https?:\/\//i.test(reviewsUrl)) {
    return { error: "Tümünü gör linki http:// veya https:// ile başlamalı." }
  }

  await setSummary({ rating, reviewCount, businessName, reviewsUrl })
  revalidateBoth()
  return { ok: true }
}

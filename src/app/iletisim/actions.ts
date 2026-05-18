"use server"

import { addInquiry } from "@/lib/inquiries-store"

export type SubmitInquiryResult =
  | { ok: true }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitInquiry(formData: FormData): Promise<SubmitInquiryResult> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const subject = String(formData.get("subject") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  if (!name || name.length < 2) return { ok: false, error: "Lütfen adınızı girin." }
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Geçerli bir e-posta adresi girin." }
  if (!message || message.length < 10) {
    return { ok: false, error: "Mesajınız en az 10 karakter olmalı." }
  }

  await addInquiry({ name, email, phone, subject, message })
  return { ok: true }
}

"use server"

import { addInquiry } from "@/lib/inquiries-store"
import { getRenderedTemplate } from "@/lib/email-templates-store"
import { sendMail, sendToAdmin } from "@/lib/mailer"
import {
  HONEYPOT_FIELD,
  checkRateLimit,
  isHoneypotTripped,
} from "@/lib/spam-guard"

export type SubmitInquiryResult =
  | { ok: true }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitInquiry(formData: FormData): Promise<SubmitInquiryResult> {
  // Honeypot — silent success-shaped reject so bots don't probe further.
  if (isHoneypotTripped(formData.get(HONEYPOT_FIELD))) {
    return { ok: true }
  }
  if (!(await checkRateLimit("inquiry"))) {
    return {
      ok: false,
      error: "Çok fazla deneme yapıldı, lütfen biraz sonra tekrar deneyin.",
    }
  }

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

  const vars = {
    name,
    email,
    phone: phone || "—",
    subject: subject || "(konu belirtilmemiş)",
    message,
  }

  // Kullanıcıya onay maili
  const userTpl = await getRenderedTemplate("inquiry_user_confirmation", vars)
  await sendMail({
    to: email,
    subject: userTpl.subject,
    text: userTpl.body,
  })

  // Admin'e bildirim — replyTo kullanıcıya işaret eder, "Reply" butonu
  // doğrudan kullanıcıya yazsın.
  const adminTpl = await getRenderedTemplate("inquiry_admin_notification", vars)
  await sendToAdmin({
    subject: adminTpl.subject,
    text: adminTpl.body,
    replyTo: email,
  })

  return { ok: true }
}

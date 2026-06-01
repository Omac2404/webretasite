"use server"

import { findAdminByEmail } from "@/lib/admin-users-store"
import { setAdminPassword } from "@/lib/admin-users-store"
import { recordAudit } from "@/lib/audit-log-store"
import { sendMail } from "@/lib/mailer"
import {
  consumeReset,
  issueResetCode,
  verifyResetCode,
} from "@/lib/password-reset-store"

export type RequestCodeState =
  | { ok: true; resetId: string; email: string }
  | { ok: false; error: string }
  | {}

export type VerifyCodeState =
  | { ok: true; resetId: string }
  | { ok: false; error: string }
  | {}

export type ResetState =
  | { ok: true }
  | { ok: false; error: string }
  | {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function requestCodeAction(
  _prev: RequestCodeState,
  formData: FormData,
): Promise<RequestCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Geçerli bir e-posta girin." }
  }
  const admin = await findAdminByEmail(email)
  // Don't leak whether the email exists — same response either way.
  // We still only send the mail if the admin really exists.
  if (admin) {
    const { id, code } = await issueResetCode(email)
    await sendMail({
      to: email,
      subject: "Webreta admin — şifre sıfırlama kodu",
      text: [
        `Merhaba ${admin.name},`,
        ``,
        `Webreta admin panelinde şifre sıfırlama kodunuz:`,
        ``,
        `    ${code}`,
        ``,
        `Bu kod 15 dakika içinde geçerlidir. Bu isteği siz yapmadıysanız bu`,
        `e-postayı dikkate almayın — şifreniz değişmeyecek.`,
        ``,
        `Webreta`,
      ].join("\n"),
    })
    await recordAudit("auth.reset.request", { target: email })
    return { ok: true, resetId: id, email }
  }
  // Fake success so an attacker can't enumerate admin emails. The next
  // step's "code wrong" message handles it.
  return { ok: true, resetId: "", email }
}

export async function verifyCodeAction(
  _prev: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const id = String(formData.get("resetId") ?? "")
  const code = String(formData.get("code") ?? "").trim()
  if (!id || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "6 haneli kodu girin." }
  }
  const res = await verifyResetCode(id, code)
  if (!res.ok) return { ok: false, error: res.error }
  return { ok: true, resetId: res.id }
}

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const id = String(formData.get("resetId") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  if (password.length < 8) {
    return { ok: false, error: "Şifre en az 8 karakter olmalı." }
  }
  if (password !== confirm) {
    return { ok: false, error: "Şifreler eşleşmiyor." }
  }
  const email = await consumeReset(id)
  if (!email) {
    return { ok: false, error: "İstek geçerli değil veya süresi dolmuş." }
  }
  const updated = await setAdminPassword(email, password)
  if (!updated) {
    return { ok: false, error: "Şifre güncellenemedi." }
  }
  await recordAudit("auth.reset.complete", { target: email })
  return { ok: true }
}

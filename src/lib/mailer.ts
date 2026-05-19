// Server-only mail gönderim katmanı. nodemailer üzerine ince bir wrapper —
// SMTP ayarlarını store'dan okur, settings.enabled değilse hiçbir şey
// göndermez (sessiz fail).

import nodemailer, { type Transporter } from "nodemailer"
import { readSmtp } from "./smtp-store"
import type { SmtpSettings } from "./smtp-types"

function buildTransporter(s: SmtpSettings): Transporter {
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.encryption === "ssl",
    requireTLS: s.encryption === "tls",
    auth: s.auth && s.username
      ? { user: s.username, pass: s.password }
      : undefined,
    tls: s.disableTLSVerification
      ? { rejectUnauthorized: false }
      : undefined,
  })
}

export type SendMailInput = {
  to: string
  subject: string
  // Düz metin gövde. {placeholder}'lar caller tarafından şablon render
  // edilmesiyle daha önce doldurulmuş olmalı.
  text: string
  // İsteğe bağlı HTML versiyonu. Yoksa düz metin gönderilir.
  html?: string
  // From override — verilmezse SMTP ayarlarındaki fromEmail/fromName kullanılır.
  from?: string
  replyTo?: string
}

export type SendMailResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: "disabled" | "no-host" | "no-recipient" | "error"; error?: string }

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const s = await readSmtp()
  if (!s.enabled) return { ok: false, reason: "disabled" }
  if (!s.host) return { ok: false, reason: "no-host" }
  if (!input.to) return { ok: false, reason: "no-recipient" }

  const fromEmail = s.fromEmail || s.username
  const from =
    input.from && !s.forceFromAddress
      ? input.from
      : s.fromName
      ? `"${s.fromName}" <${fromEmail}>`
      : fromEmail

  try {
    const transporter = buildTransporter(s)
    const info = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    })
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// Admin'e bildirim için "From" adresine gönder. From email yoksa SMTP
// username'e düşer.
export async function sendToAdmin(input: {
  subject: string
  text: string
  replyTo?: string
}): Promise<SendMailResult> {
  const s = await readSmtp()
  const adminAddress = s.fromEmail || s.username
  if (!adminAddress) return { ok: false, reason: "no-recipient" }
  return sendMail({
    to: adminAddress,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo,
  })
}

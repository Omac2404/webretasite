// Server-only mail gönderim katmanı. nodemailer üzerine ince bir wrapper —
// SMTP ayarlarını store'dan okur, settings.enabled değilse hiçbir şey
// göndermez (sessiz fail).

import nodemailer, { type Transporter } from "nodemailer"
import { readSmtp } from "./smtp-store"
import type { SmtpSettings } from "./smtp-types"

function buildTransporter(s: SmtpSettings): Transporter {
  // Port 465 daima implicit TLS (SMTPS) ister. Ayarlarda yanlışlıkla
  // "tls"/"none" seçilse bile 465'i secure kabul ederek "düz bağlan,
  // STARTTLS bekle" kilitlenmesini önlüyoruz (bu kombinasyon el sıkışmada
  // donup timeout'a kadar asılı kalıyordu).
  const secure = s.encryption === "ssl" || s.port === 465
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure,
    requireTLS: !secure && s.encryption === "tls",
    auth: s.auth && s.username
      ? { user: s.username, pass: s.password }
      : undefined,
    tls: s.disableTLSVerification
      ? { rejectUnauthorized: false }
      : undefined,
    // Yanlış host/port/şifreleme kombinasyonu sonsuza dek asılı kalmasın;
    // ~10 sn'de hata versin ki form gönderimi hızlıca tamamlansın.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
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

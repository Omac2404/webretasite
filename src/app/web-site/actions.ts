"use server"

import { getRenderedTemplate } from "@/lib/email-templates-store"
import { sendMail, sendToAdmin } from "@/lib/mailer"
import { appendQuote } from "@/lib/quotes-store"
import { checkRateLimit, isHoneypotTripped } from "@/lib/spam-guard"

export type SubmitQuoteResult =
  | { ok: true }
  | { ok: false; error: string }

export type SubmitQuoteInput = {
  industry: string
  services: string
  serviceLabel: string
  existingSiteUrl: string
  projectTypeLabel: string
  description: string
  refs: string[]
  refNotes: string
  name: string
  company: string
  email: string
  phone: string
  channelLabels: string[]
  date: string
  time: string
  // Honeypot — clients pass an empty string; bots fill it.
  honeypot?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
]

function formatDateLong(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatRefs(refs: string[]): string {
  const filled = refs.filter((r) => r.trim() !== "")
  if (filled.length === 0) return "(belirtilmemiş)"
  return filled.map((r, i) => `${i + 1}. ${r}`).join("\n")
}

export async function submitQuoteAction(
  input: SubmitQuoteInput,
): Promise<SubmitQuoteResult> {
  // Honeypot — silent success-shaped reject.
  if (isHoneypotTripped(input.honeypot)) {
    return { ok: true }
  }
  if (!(await checkRateLimit("quote"))) {
    return {
      ok: false,
      error: "Çok fazla deneme yapıldı, lütfen biraz sonra tekrar deneyin.",
    }
  }

  const name = input.name.trim()
  const email = input.email.trim()
  const phone = input.phone.trim()

  if (!name) return { ok: false, error: "Adınızı girin." }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Geçerli bir e-posta adresi girin." }
  }
  if (!phone) return { ok: false, error: "Telefon numarası girin." }

  const channels = input.channelLabels.join(" / ") || "—"

  const userVars = {
    name,
    company: input.company.trim() || "—",
    email,
    phone,
    industry: input.industry.trim() || "—",
    service: input.serviceLabel || "—",
    projectType: input.projectTypeLabel || "—",
    channels,
    date: formatDateLong(input.date),
    time: input.time || "—",
  }

  const adminVars = {
    ...userVars,
    services: input.services.trim() || "—",
    existingSiteUrl: input.existingSiteUrl.trim() || "—",
    description: input.description.trim() || "(belirtilmemiş)",
    refs: formatRefs(input.refs),
    refNotes: input.refNotes.trim() || "(belirtilmemiş)",
  }

  // Mail teslim sonuçları admin panelde "mail gönderildi mi?" kolonunu
  // dolduruyor; her iki gönderim de bağımsız değerlendirilir.
  let mailUserSent = false
  let mailAdminSent = false
  let mailError: string | undefined

  try {
    const userTpl = await getRenderedTemplate(
      "quote_user_confirmation",
      userVars,
    )
    await sendMail({
      to: email,
      subject: userTpl.subject,
      text: userTpl.body,
    })
    mailUserSent = true
  } catch (err) {
    mailError = err instanceof Error ? err.message : String(err)
  }

  try {
    const adminTpl = await getRenderedTemplate(
      "quote_admin_notification",
      adminVars,
    )
    await sendToAdmin({
      subject: adminTpl.subject,
      text: adminTpl.body,
      replyTo: email,
    })
    mailAdminSent = true
  } catch (err) {
    mailError = err instanceof Error ? err.message : String(err)
  }

  await appendQuote({
    name,
    company: input.company.trim(),
    email,
    phone,
    industry: input.industry.trim(),
    service: input.services.trim(),
    serviceLabel: input.serviceLabel,
    projectType: input.projectTypeLabel,
    description: input.description.trim(),
    existingSiteUrl: input.existingSiteUrl.trim(),
    refs: input.refs,
    refNotes: input.refNotes.trim(),
    channelLabels: input.channelLabels,
    date: input.date,
    time: input.time,
    mailUserSent,
    mailAdminSent,
    mailError,
  })

  return { ok: true }
}

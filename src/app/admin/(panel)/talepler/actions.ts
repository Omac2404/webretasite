"use server"

import { revalidatePath } from "next/cache"
import { deleteAppointment, readAppointments } from "@/lib/appointments-store"
import { recordAudit } from "@/lib/audit-log-store"
import { getRenderedTemplate } from "@/lib/email-templates-store"
import { deleteInquiry, readInquiries } from "@/lib/inquiries-store"
import { sendMail, sendToAdmin } from "@/lib/mailer"
import { deleteQuote, readQuotes } from "@/lib/quotes-store"
import { markSeenNow } from "@/lib/talepler-seen-store"

function revalidate(): void {
  revalidatePath("/admin/talepler")
}

// Called by the client right after mount so the sidebar badge clears
// once the admin actually opens this page. Layout revalidation refreshes
// the unread count for the next nav.
export async function markTaleplerSeenAction(): Promise<void> {
  await markSeenNow()
  revalidatePath("/admin", "layout")
}

// ── Mail retry ──────────────────────────────────────────────────────
// First-attempt mailing happens inside the public form actions. When
// SMTP is misconfigured or the original recipient bounced, the admin
// can manually trigger another send from each talep card.

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
]
function fmtDateLong(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export async function retryInquiryMailAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const data = await readInquiries()
  const inquiry = data.inquiries.find((i) => i.id === id)
  if (!inquiry) return
  const vars = {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || "—",
    subject: inquiry.subject || "(konu belirtilmemiş)",
    message: inquiry.message,
  }
  const userTpl = await getRenderedTemplate("inquiry_user_confirmation", vars)
  await sendMail({
    to: inquiry.email,
    subject: userTpl.subject,
    text: userTpl.body,
  })
  const adminTpl = await getRenderedTemplate("inquiry_admin_notification", vars)
  await sendToAdmin({
    subject: adminTpl.subject,
    text: adminTpl.body,
    replyTo: inquiry.email,
  })
  await recordAudit("inquiry.mail.retry", { target: id })
  revalidate()
}

export async function retryQuoteMailAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const data = await readQuotes()
  const q = data.quotes.find((qu) => qu.id === id)
  if (!q) return
  const userVars = {
    name: q.name,
    company: q.company || "—",
    email: q.email,
    phone: q.phone,
    industry: q.industry || "—",
    service: q.serviceLabel || "—",
    projectType: q.projectType || "—",
    channels: q.channelLabels.join(" / ") || "—",
    date: fmtDateLong(q.date),
    time: q.time || "—",
  }
  const adminVars = {
    ...userVars,
    services: q.service || "—",
    existingSiteUrl: q.existingSiteUrl || "—",
    description: q.description || "(belirtilmemiş)",
    refs: q.refs.filter(Boolean).map((r, i) => `${i + 1}. ${r}`).join("\n") || "(belirtilmemiş)",
    refNotes: q.refNotes || "(belirtilmemiş)",
  }
  const userTpl = await getRenderedTemplate("quote_user_confirmation", userVars)
  await sendMail({ to: q.email, subject: userTpl.subject, text: userTpl.body })
  const adminTpl = await getRenderedTemplate("quote_admin_notification", adminVars)
  await sendToAdmin({
    subject: adminTpl.subject,
    text: adminTpl.body,
    replyTo: q.email,
  })
  await recordAudit("quote.mail.retry", { target: id })
  revalidate()
}

export async function retryAppointmentMailAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const data = await readAppointments()
  const a = data.appointments.find((ap) => ap.id === id)
  if (!a) return
  const vars = {
    name: a.name || "Misafir",
    phone: a.phone,
    email: a.email,
    date: fmtDateLong(a.date),
    hour: `${String(a.hour).padStart(2, "0")}:00`,
    channel: a.channelLabel,
    package: a.pkgName,
    price: a.pkgPrice,
  }
  if (a.email) {
    const userTpl = await getRenderedTemplate("appointment_user_confirmation", vars)
    await sendMail({ to: a.email, subject: userTpl.subject, text: userTpl.body })
  }
  const adminTpl = await getRenderedTemplate("appointment_admin_notification", vars)
  await sendToAdmin({
    subject: adminTpl.subject,
    text: adminTpl.body,
    replyTo: a.email || undefined,
  })
  await recordAudit("appointment.mail.retry", { target: id })
  revalidate()
}

export async function deleteInquiryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteInquiry(id)
  await recordAudit("inquiry.delete", { target: id })
  revalidate()
}

export async function deleteQuoteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteQuote(id)
  await recordAudit("quote.delete", { target: id })
  revalidate()
}

export async function deleteAppointmentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  await deleteAppointment(id)
  await recordAudit("appointment.delete", { target: id })
  revalidate()
}

"use server"

import { appendAppointment } from "@/lib/appointments-store"
import { getRenderedTemplate } from "@/lib/email-templates-store"
import { sendMail, sendToAdmin } from "@/lib/mailer"

export type BookResult =
  | { ok: true }
  | { ok: false; error: string }

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
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`
}

export type BookAppointmentInput = {
  channelKey: string
  channelLabel: string
  pkgKey: string
  pkgName: string
  pkgPrice: string
  name: string
  phone: string
  email: string
  dateIso: string
  hour: number
}

export async function bookAppointmentAction(
  input: BookAppointmentInput,
): Promise<BookResult> {
  const phone = input.phone.replace(/\D/g, "")
  if (phone.length < 10) return { ok: false, error: "Geçerli bir telefon girin." }

  const dateLabel = formatDateLong(input.dateIso)
  const hourLabel = formatHour(input.hour)

  const vars = {
    name: input.name.trim() || "Misafir",
    phone: input.phone,
    email: input.email,
    date: dateLabel,
    hour: hourLabel,
    channel: input.channelLabel,
    package: input.pkgName,
    price: input.pkgPrice,
  }

  // Kullanıcıya onay maili — sadece e-posta verilmişse
  let mailUserSent = false
  let mailAdminSent = false
  let mailError: string | undefined

  if (input.email) {
    const userTpl = await getRenderedTemplate(
      "appointment_user_confirmation",
      vars,
    )
    const res = await sendMail({
      to: input.email,
      subject: userTpl.subject,
      text: userTpl.body,
    })
    if (res.ok) {
      mailUserSent = true
    } else if (res.reason === "error") {
      mailError = res.error
    }
  }

  // Admin'e bildirim maili — her durumda denenir
  const adminTpl = await getRenderedTemplate(
    "appointment_admin_notification",
    vars,
  )
  const adminRes = await sendToAdmin({
    subject: adminTpl.subject,
    text: adminTpl.body,
    replyTo: input.email || undefined,
  })
  if (adminRes.ok) {
    mailAdminSent = true
  } else if (adminRes.reason === "error" && !mailError) {
    mailError = adminRes.error
  }

  // Mail başarısız olsa bile randevu kaydı atılıyor — admin yine de
  // panelden müşteriyi arayabilsin.
  await appendAppointment({
    channelKey: input.channelKey,
    channelLabel: input.channelLabel,
    pkgKey: input.pkgKey,
    pkgName: input.pkgName,
    pkgPrice: input.pkgPrice,
    name: input.name.trim(),
    phone,
    email: input.email.trim(),
    date: input.dateIso,
    hour: input.hour,
    mailUserSent,
    mailAdminSent,
    mailError,
  })

  return { ok: true }
}

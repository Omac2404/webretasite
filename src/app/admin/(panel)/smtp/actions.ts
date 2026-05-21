"use server"

import { revalidatePath } from "next/cache"
import { writeSmtp } from "@/lib/smtp-store"
import type { SmtpEncryption } from "@/lib/smtp-types"
import { writeFormLegal } from "@/lib/form-legal-store"
import {
  FORM_LEGAL_KEYS,
  type FormLegalRequirements,
} from "@/lib/form-legal-types"

export type SmtpFormState = { error?: string; ok?: boolean }
export type FormLegalFormState = { error?: string; ok?: boolean }

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function b(formData: FormData, key: string): boolean {
  // Native checkbox'lar gönderilmediğinde anahtar form-data'da hiç olmuyor
  return formData.get(key) != null
}

function normalizeEncryption(value: string): SmtpEncryption {
  if (value === "ssl" || value === "tls" || value === "none") return value
  return "tls"
}

export async function saveSmtpAction(
  _prev: SmtpFormState,
  formData: FormData,
): Promise<SmtpFormState> {
  const host = s(formData, "host")
  const portRaw = Number(formData.get("port") ?? 0)
  const username = s(formData, "username")
  const fromEmail = s(formData, "fromEmail")
  const fromName = s(formData, "fromName")

  if (!host) return { error: "SMTP Host boş bırakılamaz." }
  if (!Number.isFinite(portRaw) || portRaw < 1 || portRaw > 65535) {
    return { error: "SMTP Port 1 ile 65535 arasında olmalı." }
  }
  if (fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
    return { error: "From Email Address geçerli bir e-posta olmalı." }
  }

  // Şifre özel kural: boş input = "değiştirme". Bu yüzden null bayraklı
  // sentinel olarak geçiriyoruz; form'da hidden bir "passwordChanged"
  // göndereceğiz.
  const passwordChanged = formData.get("passwordChanged") === "1"
  const password: string | null = passwordChanged
    ? String(formData.get("password") ?? "")
    : null

  await writeSmtp({
    enabled: b(formData, "enabled"),
    host,
    port: Math.floor(portRaw),
    auth: b(formData, "auth"),
    username,
    password,
    encryption: normalizeEncryption(s(formData, "encryption")),
    fromEmail,
    fromName,
    forceFromAddress: b(formData, "forceFromAddress"),
    disableTLSVerification: b(formData, "disableTLSVerification"),
  })
  revalidatePath("/admin/smtp")
  return { ok: true }
}

export async function saveFormLegalAction(
  _prev: FormLegalFormState,
  formData: FormData,
): Promise<FormLegalFormState> {
  const next = {} as FormLegalRequirements
  for (const key of FORM_LEGAL_KEYS) {
    // formData.getAll() döner: array of FormDataEntryValue. checkboxlar
    // name=`${key}__pages` ile, value=legalPageId şeklinde gönderiliyor.
    next[key] = formData
      .getAll(`${key}__pages`)
      .map((v) => String(v))
      .filter((v) => v.length > 0)
  }
  await writeFormLegal(next)
  revalidatePath("/admin/smtp")
  return { ok: true }
}

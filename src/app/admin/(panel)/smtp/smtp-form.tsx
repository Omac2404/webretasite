"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { ENCRYPTION_OPTIONS, type SmtpSettingsPublic } from "@/lib/smtp-types"
import { saveSmtpAction, type SmtpFormState } from "./actions"

const INITIAL: SmtpFormState = {}

export function SmtpForm({ settings }: { settings: SmtpSettingsPublic }) {
  const [state, formAction, pending] = useActionState(saveSmtpAction, INITIAL)
  const [showSaved, setShowSaved] = useState(false)
  // Şifre kontrolü: input boş geldiyse "değiştirme" anlamına gelir.
  // Kullanıcı bir şey yazdığı an passwordChanged=1 olarak işaretleyip
  // server action'a haber veriyoruz.
  const [passwordValue, setPasswordValue] = useState("")

  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    setPasswordValue("")
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Sender block */}
      <Section
        title="Gönderici"
        subtitle="Mailler bu hesap üzerinden, bu addan gider."
      >
        <Row label="SMTP gönderim aktif" hint="Kapalıysa formlar mail göndermez.">
          <Toggle name="enabled" defaultChecked={settings.enabled} />
        </Row>
        <Row
          label="SMTP Host"
          hint="Mail sunucusunun adresi. Örn: smtp.gmail.com"
        >
          <input
            name="host"
            type="text"
            required
            defaultValue={settings.host}
            placeholder="smtp.example.com"
            className={inputCls}
          />
        </Row>
        <Row label="SMTP Port" hint="TLS için 587, SSL için 465.">
          <input
            name="port"
            type="number"
            min={1}
            max={65535}
            required
            defaultValue={settings.port}
            className={`${inputCls} w-32`}
          />
        </Row>
        <Row label="Şifreleme türü" hint="Sunucunuz neyi destekliyorsa.">
          <select
            name="encryption"
            defaultValue={settings.encryption}
            className={`${inputCls} w-48`}
          >
            {ENCRYPTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Row>
      </Section>

      {/* Auth block */}
      <Section
        title="Kimlik doğrulama"
        subtitle="Çoğu SMTP sunucusu için kullanıcı adı + şifre gerekir."
      >
        <Row
          label="SMTP Authentication"
          hint="Önerilen: Açık. Sadece kapalı SMTP sunucuları için kapatın."
        >
          <Toggle name="auth" defaultChecked={settings.auth} />
        </Row>
        <Row label="SMTP Username" hint="Genelde tam e-posta adresi.">
          <input
            name="username"
            type="text"
            defaultValue={settings.username}
            placeholder="info@example.com"
            className={inputCls}
            autoComplete="off"
          />
        </Row>
        <Row
          label="SMTP Password"
          hint={
            settings.hasPassword
              ? "Kayıtlı şifre var. Boş bırakırsan korunur."
              : "Henüz şifre girilmedi."
          }
        >
          <input
            name="password"
            type="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder={
              settings.hasPassword ? "••••••••" : "Şifreyi gir"
            }
            className={inputCls}
            autoComplete="new-password"
          />
          <input
            type="hidden"
            name="passwordChanged"
            value={passwordValue.length > 0 ? "1" : "0"}
          />
        </Row>
      </Section>

      {/* From block */}
      <Section
        title="From bilgileri"
        subtitle="Çıkan mailde alıcının göreceği gönderici adı ve adresi."
      >
        <Row label="From Email Address" hint="Boşsa SMTP Username kullanılır.">
          <input
            name="fromEmail"
            type="email"
            defaultValue={settings.fromEmail}
            placeholder="info@example.com"
            className={inputCls}
            autoComplete="off"
          />
        </Row>
        <Row label="From Name">
          <input
            name="fromName"
            type="text"
            defaultValue={settings.fromName}
            placeholder="Webreta"
            className={inputCls}
          />
        </Row>
        <Row
          label="Force From Address"
          hint="Açıksa tüm mailler bu adresten gönderilir (uygulama farklı bir from yazsa bile)."
        >
          <Toggle
            name="forceFromAddress"
            defaultChecked={settings.forceFromAddress}
          />
        </Row>
      </Section>

      {/* Advanced */}
      <Section
        title="İleri ayarlar"
        subtitle="Sadece sertifika sorunu yaşıyorsanız değiştirin."
      >
        <Row
          label="SSL/TLS doğrulamasını devre dışı bırak"
          hint="Self-signed sertifika kullanan hostlar için. Önerilmez."
        >
          <Toggle
            name="disableTLSVerification"
            defaultChecked={settings.disableTLSVerification}
          />
        </Row>
      </Section>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
        </button>
        {showSaved && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700">
            <Check size={14} />
            Kaydedildi
          </span>
        )}
      </div>
    </form>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div>
        <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
        <p className="mt-1 text-[12px] text-black/50">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <div>
        <div className="text-[12.5px] font-medium text-[#0a0a0a]">{label}</div>
        {hint && (
          <p className="mt-0.5 text-[11.5px] leading-snug text-black/45">
            {hint}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </label>
  )
}

function Toggle({
  name,
  defaultChecked,
}: {
  name: string
  defaultChecked?: boolean
}) {
  return (
    <input
      name={name}
      type="checkbox"
      defaultChecked={defaultChecked}
      className="h-4 w-4 cursor-pointer rounded border-black/[0.2] text-[#3c639f] focus:ring-[#3c639f]/30"
    />
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

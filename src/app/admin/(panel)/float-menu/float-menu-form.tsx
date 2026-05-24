"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Globe, Loader2, Megaphone, Phone } from "lucide-react"
import type { FloatMenuConfig } from "@/lib/float-menu-types"
import { saveFloatMenuAction, type FloatMenuFormState } from "./actions"

const INITIAL: FloatMenuFormState = {}

export function FloatMenuAdminForm({ config }: { config: FloatMenuConfig }) {
  const [state, formAction, pending] = useActionState(
    saveFloatMenuAction,
    INITIAL,
  )
  const [showSaved, setShowSaved] = useState(false)
  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Genel */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          title="Genel"
          subtitle="Tüm yüzen menüyü tek tıkla aç/kapa."
        />
        <div className="mt-4">
          <Toggle
            name="enabled"
            defaultChecked={config.enabled}
            label="Yüzen menüyü göster"
            hint="Kapalıyken hiçbir cihazda görünmez."
          />
        </div>
      </section>

      {/* Web Site */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          icon={<Globe size={15} />}
          title="Web Site butonu"
          subtitle="Soldaki ilk buton."
        />
        <div className="mt-4 grid grid-cols-1 gap-3">
          <Toggle
            name="webSite_enabled"
            defaultChecked={config.webSite.enabled}
            label="Bu butonu göster"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Etiket">
              <input
                name="webSite_label"
                type="text"
                defaultValue={config.webSite.label}
                placeholder="Web Site"
                className={inputCls}
              />
            </Field>
            <Field label="Bağlantı">
              <input
                name="webSite_href"
                type="text"
                defaultValue={config.webSite.href}
                placeholder="/web-site"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Reklamlar */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          icon={<Megaphone size={15} />}
          title="Reklamlar butonu"
          subtitle="Ortadaki buton."
        />
        <div className="mt-4 grid grid-cols-1 gap-3">
          <Toggle
            name="ads_enabled"
            defaultChecked={config.ads.enabled}
            label="Bu butonu göster"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Etiket">
              <input
                name="ads_label"
                type="text"
                defaultValue={config.ads.label}
                placeholder="Reklamlar"
                className={inputCls}
              />
            </Field>
            <Field label="Bağlantı">
              <input
                name="ads_href"
                type="text"
                defaultValue={config.ads.href}
                placeholder="/dijital-reklamlar"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* İletişim */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader
          icon={<Phone size={15} />}
          title="İletişim butonu"
          subtitle="Sağdaki buton — tıklanınca yukarı doğru telefon + WhatsApp seçimi açılır."
        />
        <div className="mt-4 grid grid-cols-1 gap-3">
          <Toggle
            name="contact_enabled"
            defaultChecked={config.contact.enabled}
            label="Bu butonu göster"
          />
          <Field label="Etiket">
            <input
              name="contact_label"
              type="text"
              defaultValue={config.contact.label}
              placeholder="İletişim"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Telefon numarası"
              hint="Tıklanınca arama başlatır. Uluslararası formatta gir."
            >
              <input
                name="contact_phone"
                type="text"
                defaultValue={config.contact.phone}
                placeholder="+90 542 580 94 92"
                className={inputCls}
              />
            </Field>
            <Field
              label="WhatsApp numarası"
              hint="Genelde telefon ile aynıdır."
            >
              <input
                name="contact_whatsapp"
                type="text"
                defaultValue={config.contact.whatsapp}
                placeholder="+90 542 580 94 92"
                className={inputCls}
              />
            </Field>
          </div>
          <Field
            label="WhatsApp ön mesajı"
            hint="WhatsApp açıldığında otomatik dolan mesaj."
          >
            <textarea
              name="contact_whatsappMessage"
              rows={2}
              defaultValue={config.contact.whatsappMessage}
              placeholder="Merhaba, web siteniz üzerinden ulaşıyorum."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </section>

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

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && (
        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#3c639f]/10 text-[#3c639f]">
          {icon}
        </span>
      )}
      <div>
        <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
        <p className="mt-1 text-[12px] text-black/50">{subtitle}</p>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-black/55">{label}</span>
        {hint && (
          <span className="max-w-[60%] text-right text-[11px] text-black/40">
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  )
}

function Toggle({
  name,
  defaultChecked,
  label,
  hint,
}: {
  name: string
  defaultChecked: boolean
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-black/[0.08] bg-[#fafbfd] px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-[12.5px] font-medium text-[#0a0a0a]">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 text-[11px] text-black/45">{hint}</span>
        )}
      </div>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="h-5 w-9 rounded-full bg-black/15 transition-colors peer-checked:bg-[#3c639f]" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

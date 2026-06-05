"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { ContactContent } from "@/lib/contact-types"
import { saveContactAction, type ContactFormState } from "./actions"

const INITIAL: ContactFormState = {}

export function ContactAdminForm({ content }: { content: ContactContent }) {
  const [state, formAction, pending] = useActionState(
    saveContactAction,
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
      {/* Hero */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="Hero bloğu" subtitle="Sayfanın en üstündeki büyük başlık ve giriş paragrafı." />

        <div className="mt-4">
          <Field label="Üst etiket">
            <input name="hero_kicker" type="text" defaultValue={content.hero.kicker} placeholder="İletişim" className={inputCls} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Açılış" hint="Başlığın başı.">
            <input name="hero_titleLeading" type="text" defaultValue={content.hero.titleLeading} className={inputCls} />
          </Field>
          <Field label="Vurgu" hint="Mavi renkle çıkar.">
            <input name="hero_titleHighlight" type="text" required defaultValue={content.hero.titleHighlight} className={inputCls} />
          </Field>
          <Field label="Kapanış">
            <input name="hero_titleTrailing" type="text" defaultValue={content.hero.titleTrailing} className={inputCls} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Giriş paragrafı">
            <textarea name="hero_intro" rows={3} defaultValue={content.hero.intro} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </section>

      {/* Info cards */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="Bilgi kartları" subtitle="4 kartın içeriği — e-posta, telefon, adres, çalışma saatleri." />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="E-posta">
            <input name="info_email" type="text" defaultValue={content.info.email} placeholder="info@webreta.com.tr" className={inputCls} />
          </Field>
          <Field label="Telefon">
            <input name="info_phone" type="text" defaultValue={content.info.phone} placeholder="+90 (XXX) XXX XX XX" className={inputCls} />
          </Field>
          <Field label="Adres - 1. satır (ülke / şehir)">
            <input name="info_addressLine1" type="text" defaultValue={content.info.addressLine1} placeholder="İzmir, Türkiye" className={inputCls} />
          </Field>
          <Field label="Çalışma saatleri">
            <input name="info_hours" type="text" defaultValue={content.info.hours} placeholder="Pazartesi – Cuma · 09:00 – 18:00" className={inputCls} />
          </Field>
          <Field label="Adres - 2. satır (kalan detaylar)">
            <input name="info_addressLine2" type="text" defaultValue={content.info.addressLine2} placeholder="Örn. Konak Mh. No:12" className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Form section */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="Form bloğu" subtitle="Sol taraftaki form alanının başlık ve açıklaması." />

        <div className="mt-4">
          <Field label="Üst etiket">
            <input name="form_kicker" type="text" defaultValue={content.form.kicker} placeholder="Mesaj gönderin" className={inputCls} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Açılış">
            <input name="form_titleLeading" type="text" defaultValue={content.form.titleLeading} className={inputCls} />
          </Field>
          <Field label="Vurgu">
            <input name="form_titleHighlight" type="text" required defaultValue={content.form.titleHighlight} className={inputCls} />
          </Field>
          <Field label="Kapanış">
            <input name="form_titleTrailing" type="text" defaultValue={content.form.titleTrailing} className={inputCls} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Açıklama paragrafı">
            <textarea name="form_intro" rows={3} defaultValue={content.form.intro} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </section>

      {/* Map section */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <SectionHeader title="Harita bloğu" subtitle="Sağ taraftaki harita kartı — başlık, açıklama ve Google Maps gömme." />

        <div className="mt-4">
          <Field label="Üst etiket">
            <input name="map_kicker" type="text" defaultValue={content.map.kicker} placeholder="Konum" className={inputCls} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Açılış">
            <input name="map_titleLeading" type="text" defaultValue={content.map.titleLeading} className={inputCls} />
          </Field>
          <Field label="Vurgu">
            <input name="map_titleHighlight" type="text" required defaultValue={content.map.titleHighlight} className={inputCls} />
          </Field>
          <Field label="Kapanış">
            <input name="map_titleTrailing" type="text" defaultValue={content.map.titleTrailing} className={inputCls} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Açıklama paragrafı">
            <textarea name="map_intro" rows={3} defaultValue={content.map.intro} className={`${inputCls} resize-none`} />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Google Maps gömme kodu"
            hint="Google Maps > Paylaş > Haritayı yerleştir > HTML'i kopyala. Tam iframe kodunu veya sadece src URL'ini yapıştır."
          >
            <textarea
              name="map_embedSrc"
              rows={4}
              defaultValue={content.map.embedSrc}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" ...></iframe>'
              className={`${inputCls} resize-y font-mono text-[11.5px]`}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Paylaşım linki (opsiyonel)"
            hint="Haritanın altındaki “yeni sekmede aç” bağlantısı için. Google Maps paylaşım URL'ini yapıştır."
          >
            <input
              name="map_shareUrl"
              type="text"
              defaultValue={content.map.shareUrl}
              placeholder="https://maps.app.goo.gl/..."
              className={inputCls}
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

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
      <p className="mt-1 text-[12px] text-black/50">{subtitle}</p>
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
        {hint && <span className="max-w-[60%] text-right text-[11px] text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

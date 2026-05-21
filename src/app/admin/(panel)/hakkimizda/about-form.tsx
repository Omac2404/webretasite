"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Check, ImageIcon, Loader2, Upload } from "lucide-react"
import type { AboutData } from "@/lib/about-types"
import { saveAboutAction, type SaveAboutState } from "./actions"

const INITIAL: SaveAboutState = {}

export function AboutForm({ about }: { about: AboutData }) {
  const [state, formAction, pending] = useActionState(
    saveAboutAction,
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
    <form action={formAction} className="flex flex-col gap-7">
      {/* Hero */}
      <Card title="Hero" description="Sayfanın en üstü — başlık ve kısa giriş.">
        <Field
          name="hero__kicker"
          label="Üst etiket"
          defaultValue={about.hero.kicker}
          hint="Başlığın üstündeki küçük büyük harf etiket. Örn: HAKKIMIZDA"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field
            name="hero__titleLeader"
            label="Başlık (başlangıç)"
            defaultValue={about.hero.titleLeader}
            hint="Vurgudan önceki kısım."
          />
          <Field
            name="hero__titleHighlight"
            label="Başlık (vurgulu)"
            defaultValue={about.hero.titleHighlight}
            hint="Mavi-bold render edilir."
          />
          <Field
            name="hero__titleTrailer"
            label="Başlık (kapanış)"
            defaultValue={about.hero.titleTrailer}
            hint="Vurgudan sonraki kısım."
          />
        </div>
        <TextArea
          name="hero__subtitle"
          label="Alt başlık"
          defaultValue={about.hero.subtitle}
          rows={3}
        />
      </Card>

      {/* Row 1 — image left, text right */}
      <Card
        title="Sıra 1 — Görsel solda, yazı sağda"
        description="İlk alternatif blok. Solda görsel, sağda metin."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
          <ImageUploader
            inputName="row1__image"
            current={about.row1.imageUrl}
            altInputName="row1__imageAlt"
            altCurrent={about.row1.imageAlt}
          />
          <div className="flex flex-col gap-3">
            <Field
              name="row1__kicker"
              label="Üst etiket"
              defaultValue={about.row1.kicker}
            />
            <Field
              name="row1__title"
              label="Başlık"
              defaultValue={about.row1.title}
              required
            />
            <TextArea
              name="row1__body"
              label="Gövde"
              defaultValue={about.row1.body}
              rows={6}
              hint="İki boş satır yeni paragraf açar."
            />
          </div>
        </div>
      </Card>

      {/* Row 2 — text left, image right */}
      <Card
        title="Sıra 2 — Yazı solda, görsel sağda"
        description="İkinci alternatif blok. Solda metin, sağda görsel."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-3">
            <Field
              name="row2__kicker"
              label="Üst etiket"
              defaultValue={about.row2.kicker}
            />
            <Field
              name="row2__title"
              label="Başlık"
              defaultValue={about.row2.title}
              required
            />
            <TextArea
              name="row2__body"
              label="Gövde"
              defaultValue={about.row2.body}
              rows={6}
              hint="İki boş satır yeni paragraf açar."
            />
          </div>
          <ImageUploader
            inputName="row2__image"
            current={about.row2.imageUrl}
            altInputName="row2__imageAlt"
            altCurrent={about.row2.imageAlt}
          />
        </div>
      </Card>

      {/* CTA */}
      <Card
        title="CTA — Bir proje konuşalım mı?"
        description="Sayfanın altındaki yönlendirme bloğu."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field
            name="cta__title"
            label="Başlık"
            defaultValue={about.cta.title}
            required
          />
          <Field
            name="cta__buttonLabel"
            label="Buton metni"
            defaultValue={about.cta.buttonLabel}
            required
          />
        </div>
        <Field
          name="cta__buttonHref"
          label="Buton linki"
          defaultValue={about.cta.buttonHref}
          hint="Örn: /iletisim"
        />
        <TextArea
          name="cta__body"
          label="Açıklama"
          defaultValue={about.cta.body}
          rows={2}
        />
      </Card>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex items-center gap-3 self-start rounded-xl bg-white px-3 py-2 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Hakkımızda sayfasını kaydet"}
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

function Card({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="border-b border-black/[0.06] pb-3">
        <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
          {title}
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-black/55">
          {description}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({
  name,
  label,
  defaultValue,
  hint,
  required,
}: {
  name: string
  label: string
  defaultValue: string
  hint?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">
        {label}
        {hint && (
          <span className="ml-2 text-[10.5px] font-normal text-black/40">
            {hint}
          </span>
        )}
      </span>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        required={required}
        className={inputCls}
      />
    </label>
  )
}

function TextArea({
  name,
  label,
  defaultValue,
  rows,
  hint,
}: {
  name: string
  label: string
  defaultValue: string
  rows: number
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">
        {label}
        {hint && (
          <span className="ml-2 text-[10.5px] font-normal text-black/40">
            {hint}
          </span>
        )}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`${inputCls} resize-y leading-relaxed`}
      />
    </label>
  )
}

function ImageUploader({
  inputName,
  current,
  altInputName,
  altCurrent,
}: {
  inputName: string
  current: string
  altInputName: string
  altCurrent: string
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const displayed = preview ?? (current || null)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-black/15 bg-[#fafafa]">
        {displayed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayed}
            alt="Önizleme"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-black/35">
            <ImageIcon size={28} strokeWidth={1.5} />
            <span className="text-[11.5px]">Görsel yok — placeholder</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[12px] font-medium text-[#3c639f] transition-colors hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.04]"
      >
        <Upload size={13} />
        {current ? "Görseli değiştir" : "Görsel yükle"}
      </button>
      <input
        ref={fileRef}
        name={inputName}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0]
          if (!f) return
          const reader = new FileReader()
          reader.onload = () => setPreview(String(reader.result))
          reader.readAsDataURL(f)
        }}
      />

      <input
        name={altInputName}
        type="text"
        defaultValue={altCurrent}
        placeholder="Görsel alt metni"
        className={`${inputCls} text-[12px]`}
      />
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

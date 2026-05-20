"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, AlertCircle, Loader2, Plus, Trash2, ImageIcon } from "lucide-react"
import {
  MAX_KOBI_BULLETS,
  MAX_KOBI_TAGS,
  type KobiBanner,
} from "@/lib/web-packages-types"
import { saveKobiBannerAction, type SaveState } from "./actions"

export function KobiBannerForm({ initial }: { initial: KobiBanner }) {
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveKobiBannerAction,
    {},
  )
  const [tags, setTags] = useState<string[]>(initial.tags)
  const [bullets, setBullets] = useState<string[]>(initial.bullets)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  return (
    <form action={formAction} className="flex flex-col gap-5" encType="multipart/form-data">
      {/* Image */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col gap-2">
          <span className="text-[11.5px] font-medium text-black/55">
            Arkaplan görseli
          </span>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-black/[0.08] bg-[#3c639f]/[0.06]">
            {imagePreview || initial.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview || initial.imageUrl}
                alt="KOBİ banner görseli"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-black/30">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return setImagePreview(null)
              const url = URL.createObjectURL(f)
              setImagePreview(url)
            }}
            className="text-[12px]"
          />
          {initial.imageUrl && (
            <label className="inline-flex items-center gap-1.5 text-[11.5px] text-red-600">
              <input type="checkbox" name="removeImage" className="h-3.5 w-3.5" />
              Mevcut görseli kaldır
            </label>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Sol panel etiketi (eyebrow)">
            <input
              name="eyebrow"
              type="text"
              defaultValue={initial.eyebrow}
              className={fieldInput}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Büyük başlık (örn. KOBİ)">
              <input
                name="bigTitle"
                type="text"
                defaultValue={initial.bigTitle}
                className={fieldInput}
              />
            </Field>
            <Field label="Alt yazı (örn. Küçük & Orta Ölçek)">
              <input
                name="bigSubtitle"
                type="text"
                defaultValue={initial.bigSubtitle}
                className={fieldInput}
              />
            </Field>
          </div>

          <BulletEditor
            label="Etiketler"
            hint={`En fazla ${MAX_KOBI_TAGS}`}
            inputName="tags"
            values={tags}
            onChange={setTags}
            max={MAX_KOBI_TAGS}
          />
        </div>
      </div>

      {/* Right side copy */}
      <div className="border-t border-black/[0.06] pt-5">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.10em] text-[#3c639f]">
          Sağ panel
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <Field label="Eyebrow (örn. Aradığınız bu olabilir)">
            <input
              name="rightEyebrow"
              type="text"
              defaultValue={initial.rightEyebrow}
              className={fieldInput}
            />
          </Field>
          <Field label="Ana başlık">
            <input
              name="title"
              type="text"
              defaultValue={initial.title}
              className={fieldInput}
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              name="description"
              defaultValue={initial.description}
              rows={4}
              className={`${fieldInput} resize-none`}
            />
          </Field>
          <BulletEditor
            label="Maddeler"
            hint={`En fazla ${MAX_KOBI_BULLETS}`}
            inputName="bullets"
            values={bullets}
            onChange={setBullets}
            max={MAX_KOBI_BULLETS}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.5fr]">
            <Field label="Buton yazısı">
              <input
                name="ctaLabel"
                type="text"
                defaultValue={initial.ctaLabel}
                className={fieldInput}
              />
            </Field>
            <Field label="Buton linki">
              <input
                name="ctaHref"
                type="text"
                defaultValue={initial.ctaHref}
                placeholder="https://kobi.webreta.com"
                className={fieldInput}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {state.ok && !isPending && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
            <Check size={14} /> Kaydedildi
          </span>
        )}
        {state.error && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
            <AlertCircle size={14} /> {state.error}
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Kaydet
        </button>
      </div>
    </form>
  )
}

function BulletEditor({
  label,
  hint,
  inputName,
  values,
  onChange,
  max,
}: {
  label: string
  hint: string
  inputName: string
  values: string[]
  onChange: (v: string[]) => void
  max: number
}) {
  // Always render at least one input so users can fill the first row
  // without having to click "ekle" first.
  const rows = values.length === 0 ? [""] : values

  // Hidden inputs ensure removed rows submit as empty so the action
  // filters them. We use controlled inputs to render the rows.
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-black/55">
          {label}{" "}
          <span className="text-black/35">
            ({values.length}/{max})
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (values.length >= max) return
            onChange([...values, ""])
          }}
          disabled={values.length >= max}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={12} /> Ekle
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {rows.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/[0.04] text-[11px] font-medium text-black/50">
              {i + 1}
            </span>
            <input
              type="text"
              name={inputName}
              value={value}
              onChange={(e) => {
                const next = rows.slice()
                next[i] = e.target.value
                onChange(next)
              }}
              className={fieldInput}
              placeholder={`${label} ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Sil"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {children}
    </label>
  )
}

const fieldInput =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

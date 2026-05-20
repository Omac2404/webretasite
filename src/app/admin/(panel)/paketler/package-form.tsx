"use client"

import { useActionState, useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import {
  MAX_AUDIENCE,
  MAX_ITEMS,
  type ChannelKey,
  type Pkg,
} from "@/lib/packages-types"
import { updatePackageAction, type UpdateState } from "./actions"
import { fieldInput, FormFooter } from "./channel-form"

const INITIAL: UpdateState = {}

// Pad an array of strings to `length` with empty strings so we can always
// render the same number of inputs. The action filters empties out before
// persisting.
function padTo(arr: string[], length: number): string[] {
  if (arr.length >= length) return arr.slice(0, length)
  return [...arr, ...Array.from({ length: length - arr.length }, () => "")]
}

export function PackageForm({
  channelKey,
  pkg,
  featured,
}: {
  channelKey: ChannelKey
  pkg: Pkg
  featured: boolean
}) {
  const [state, formAction, pending] = useActionState(
    updatePackageAction,
    INITIAL,
  )
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true)
      const t = setTimeout(() => setSavedFlash(false), 1600)
      return () => clearTimeout(t)
    }
  }, [state.ok])

  const audience = padTo(pkg.audience, MAX_AUDIENCE)
  const items = padTo(pkg.items, MAX_ITEMS)
  const filledItems = pkg.items.filter((s) => s.trim().length > 0).length

  return (
    <form
      action={formAction}
      className={`rounded-2xl border bg-white p-5 ${
        featured
          ? "border-[#3c639f]/40 shadow-[0_4px_18px_-8px_rgba(60,99,159,0.25)]"
          : "border-black/[0.06]"
      }`}
    >
      <input type="hidden" name="channel" value={channelKey} />
      <input type="hidden" name="package" value={pkg.key} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            {pkg.name || "(isimsiz paket)"}
          </div>
          <span className="text-[11px] text-black/40">
            · {pkg.key}
          </span>
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3c639f]/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#3c639f]">
              <Sparkles size={10} />
              En Popüler
            </span>
          )}
        </div>
        <div className="text-[11px] text-black/40">
          {filledItems}/{MAX_ITEMS} madde
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px]">
        <Field label="Paket adı">
          <input
            name="name"
            type="text"
            defaultValue={pkg.name}
            required
            className={fieldInput}
          />
        </Field>
        <Field label="Fiyat (örn. ₺7.500)">
          <input
            name="price"
            type="text"
            defaultValue={pkg.price}
            required
            className={fieldInput}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Kısa açıklama">
          <textarea
            name="tagline"
            rows={2}
            defaultValue={pkg.tagline}
            required
            className={`${fieldInput} resize-none`}
          />
        </Field>
      </div>

      {/* Audience — exactly MAX_AUDIENCE rows; empty rows are dropped on save */}
      <div className="mt-5">
        <SectionLabel
          title="Kimler için uygun"
          hint={`En fazla ${MAX_AUDIENCE} madde. Boş bırakılanlar kaydedilmez.`}
        />
        <div className="mt-2.5 flex flex-col gap-2">
          {audience.map((value, i) => (
            <NumberedInput
              key={i}
              n={i + 1}
              name="audience"
              defaultValue={value}
              placeholder={`Hedef kitle ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Items — MAX_ITEMS rows, two-column on md+ to mirror the public modal */}
      <div className="mt-5">
        <SectionLabel
          title="Paket içeriği (detay maddeleri)"
          hint={`En fazla ${MAX_ITEMS} madde. Detay popup'ında 2 sütuna bölünür.`}
        />
        <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-x-3">
          {items.map((value, i) => (
            <NumberedInput
              key={i}
              n={i + 1}
              name="items"
              defaultValue={value}
              placeholder={`Madde ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* WhatsApp pre-filled message — when the visitor clicks the
          "WhatsApp'tan yazın" CTA for this package, this text is loaded
          into the chat. Boş bırakılırsa varsayılana (kanal + paket adı +
          fiyat) düşer. */}
      <div className="mt-5">
        <SectionLabel
          title="WhatsApp ön mesaj"
          hint="Boş bırakılırsa otomatik bir mesaj oluşturulur."
        />
        <div className="mt-2.5">
          <textarea
            name="whatsappMessage"
            rows={3}
            defaultValue={pkg.whatsappMessage ?? ""}
            placeholder={`Merhaba, ${pkg.name} (${pkg.price}/ay) hakkında bilgi almak istiyorum.`}
            className={`${fieldInput} resize-none`}
          />
        </div>
      </div>

      <div className="mt-5">
        <FormFooter
          pending={pending}
          error={state.error}
          savedFlash={savedFlash}
        />
      </div>
    </form>
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

function SectionLabel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-black/[0.06] pt-4">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.10em] text-[#3c639f]">
        {title}
      </span>
      <span className="text-[11px] text-black/40">{hint}</span>
    </div>
  )
}

function NumberedInput({
  n,
  name,
  defaultValue,
  placeholder,
}: {
  n: number
  name: string
  defaultValue: string
  placeholder: string
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/[0.04] text-[11px] font-medium text-black/50">
        {n}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={fieldInput}
      />
    </label>
  )
}

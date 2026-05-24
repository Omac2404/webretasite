"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { updateChannelAction, type UpdateState } from "./actions"
import type { ChannelKey } from "@/lib/packages-types"

const INITIAL: UpdateState = {}

export function ChannelForm({
  channelKey,
  label,
  pageTitle,
  short,
  intro,
}: {
  channelKey: ChannelKey
  label: string
  pageTitle: string
  short: string
  intro: string
}) {
  const [state, formAction, pending] = useActionState(
    updateChannelAction,
    INITIAL,
  )
  const [savedFlash, setSavedFlash] = useState(false)

  // Flash a "Kaydedildi" pill for ~1.6s after a successful save.
  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true)
      const t = setTimeout(() => setSavedFlash(false), 1600)
      return () => clearTimeout(t)
    }
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="channel" value={channelKey} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Sekme adı (uzun)" hint="Üstteki sekme butonunda görünür.">
          <input
            name="label"
            type="text"
            defaultValue={label}
            required
            className={fieldInput}
          />
        </Field>
        <Field label="Kısa ad (chip/etiketlerde)">
          <input
            name="short"
            type="text"
            defaultValue={short}
            className={fieldInput}
          />
        </Field>
      </div>

      <Field
        label="Sayfa başlığı (h1)"
        hint="Sekme seçildiğinde sayfanın üstünde büyük başlık olarak görünür. Boş bırakılırsa sekme adı kullanılır."
      >
        <input
          name="pageTitle"
          type="text"
          defaultValue={pageTitle}
          placeholder="Boş bırakılırsa sekme adı kullanılır"
          className={fieldInput}
        />
      </Field>

      <Field label="Sayfa açıklaması">
        <textarea
          name="intro"
          rows={2}
          defaultValue={intro}
          required
          className={`${fieldInput} resize-none`}
        />
      </Field>

      <FormFooter
        pending={pending}
        error={state.error}
        savedFlash={savedFlash}
      />
    </form>
  )
}

const fieldInput =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

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
      <span className="text-[11.5px] font-medium text-black/55">
        {label}
        {hint && (
          <span className="ml-2 font-normal text-black/40">{hint}</span>
        )}
      </span>
      {children}
    </label>
  )
}

export function FormFooter({
  pending,
  error,
  savedFlash,
  submitLabel = "Kaydet",
}: {
  pending: boolean
  error?: string
  savedFlash: boolean
  submitLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-h-[28px] flex-1">
        {error && (
          <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] text-red-700">
            {error}
          </div>
        )}
        {!error && savedFlash && (
          <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] text-emerald-700">
            <Check size={13} strokeWidth={2.5} />
            Kaydedildi
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        {pending ? "Kaydediliyor..." : submitLabel}
      </button>
    </div>
  )
}

export { fieldInput }

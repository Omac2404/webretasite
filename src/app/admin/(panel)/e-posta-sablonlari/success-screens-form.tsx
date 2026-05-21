"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  FORM_SUCCESS_META,
  type FormSuccessScreens,
  type FormSuccessMeta,
} from "@/lib/form-success-types"
import {
  saveSuccessScreensAction,
  type SuccessScreensFormState,
} from "./actions"

const INITIAL: SuccessScreensFormState = {}

export function SuccessScreensForm({
  screens,
}: {
  screens: FormSuccessScreens
}) {
  const [state, formAction, pending] = useActionState(
    saveSuccessScreensAction,
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
    <form action={formAction} className="flex flex-col gap-5">
      {FORM_SUCCESS_META.map((meta) => (
        <SuccessBlock key={meta.key} meta={meta} initial={screens[meta.key]} />
      ))}

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
          {pending ? "Kaydediliyor..." : "Tüm ekranları kaydet"}
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

function SuccessBlock({
  meta,
  initial,
}: {
  meta: FormSuccessMeta
  initial: { title: string; body: string; ctaLabel: string }
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4">
      <div>
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          {meta.label}
        </div>
        <p className="mt-0.5 text-[11.5px] leading-snug text-black/55">
          {meta.description}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Başlık
          </span>
          <input
            name={`${meta.key}__title`}
            type="text"
            required
            defaultValue={initial.title}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Gövde
            <span className="ml-2 text-[10.5px] font-normal text-black/40">
              Yeni paragraf için iki boş satır bırak
            </span>
          </span>
          <textarea
            name={`${meta.key}__body`}
            required
            rows={4}
            defaultValue={initial.body}
            className={`${inputCls} resize-y leading-relaxed`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Buton metni
            <span className="ml-2 text-[10.5px] font-normal text-black/40">
              {meta.ctaHint}
            </span>
          </span>
          <input
            name={`${meta.key}__ctaLabel`}
            type="text"
            required
            defaultValue={initial.ctaLabel}
            className={inputCls}
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/45">
            Değişkenler
          </span>
          {meta.placeholders.length === 0 ? (
            <span className="text-[11px] text-black/45">
              (Bu ekranda dinamik değişken yok.)
            </span>
          ) : (
            meta.placeholders.map((p) => (
              <code
                key={p}
                className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono text-[#3c639f] ring-1 ring-inset ring-black/[0.06]"
              >
                {`{${p}}`}
              </code>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import type { ReviewsSummary } from "@/lib/reviews-store"
import { saveSummaryAction, type SummaryState } from "./actions"

const INITIAL: SummaryState = {}

export function SummaryForm({ summary }: { summary: ReviewsSummary }) {
  const [state, formAction, pending] = useActionState(saveSummaryAction, INITIAL)
  const [showSaved, setShowSaved] = useState(false)
  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_140px_1fr]">
        <Field label="Puan" hint="0-5 arası">
          <input
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            defaultValue={summary.rating}
            className={inputCls}
          />
        </Field>
        <Field label="Yorum sayısı">
          <input
            name="reviewCount"
            type="number"
            min={0}
            step={1}
            defaultValue={summary.reviewCount}
            className={inputCls}
          />
        </Field>
        <Field label="Firma adı">
          <input
            name="businessName"
            type="text"
            required
            defaultValue={summary.businessName}
            placeholder="Webreta Web Teknolojileri"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Tüm yorumlar linki" hint="Google Maps yorumlar sayfası">
        <input
          name="reviewsUrl"
          type="url"
          defaultValue={summary.reviewsUrl}
          placeholder="https://www.google.com/maps/place/..."
          className={inputCls}
        />
      </Field>

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
          {pending ? "Kaydediliyor..." : "Özeti kaydet"}
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
        {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

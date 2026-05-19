"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  TEMPLATE_META,
  type EmailTemplates,
  type TemplateKey,
} from "@/lib/email-templates-types"
import { saveTemplatesAction, type TemplatesFormState } from "./actions"

const INITIAL: TemplatesFormState = {}

export function TemplatesForm({ templates }: { templates: EmailTemplates }) {
  const [state, formAction, pending] = useActionState(
    saveTemplatesAction,
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
      {TEMPLATE_META.map((meta) => (
        <TemplateBlock
          key={meta.key}
          templateKey={meta.key}
          label={meta.label}
          description={meta.description}
          placeholders={meta.placeholders}
          initial={templates[meta.key]}
        />
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
          {pending ? "Kaydediliyor..." : "Şablonları kaydet"}
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

function TemplateBlock({
  templateKey,
  label,
  description,
  placeholders,
  initial,
}: {
  templateKey: TemplateKey
  label: string
  description: string
  placeholders: string[]
  initial: { subject: string; body: string }
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-[#0a0a0a]">
            {label}
          </div>
          <p className="mt-0.5 text-[11.5px] leading-snug text-black/55">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">Konu</span>
          <input
            name={`${templateKey}__subject`}
            type="text"
            required
            defaultValue={initial.subject}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Gövde
          </span>
          <textarea
            name={`${templateKey}__body`}
            required
            rows={8}
            defaultValue={initial.body}
            className={`${inputCls} resize-y font-mono text-[12px] leading-relaxed`}
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/45">
            Değişkenler
          </span>
          {placeholders.map((p) => (
            <code
              key={p}
              className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono text-[#3c639f] ring-1 ring-inset ring-black/[0.06]"
            >
              {`{${p}}`}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

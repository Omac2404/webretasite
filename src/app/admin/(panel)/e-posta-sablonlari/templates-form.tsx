"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2, User, Inbox } from "lucide-react"
import {
  TEMPLATE_GROUPS,
  TEMPLATE_META,
  type EmailTemplates,
  type TemplateKey,
  type TemplateMeta,
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
    <form action={formAction} className="flex flex-col gap-7">
      {TEMPLATE_GROUPS.map((group) => {
        const userMeta = TEMPLATE_META.find(
          (m) => m.group === group.key && m.audience === "user",
        )
        const adminMeta = TEMPLATE_META.find(
          (m) => m.group === group.key && m.audience === "admin",
        )
        if (!userMeta || !adminMeta) return null
        return (
          <section
            key={group.key}
            className="rounded-2xl border border-black/[0.06] bg-white p-5"
          >
            <div className="border-b border-black/[0.06] pb-4">
              <div className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
                {group.label}
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-black/55">
                {group.description}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TemplateBlock
                meta={userMeta}
                initial={templates[userMeta.key]}
                accent="user"
              />
              <TemplateBlock
                meta={adminMeta}
                initial={templates[adminMeta.key]}
                accent="admin"
              />
            </div>
          </section>
        )
      })}

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
          {pending ? "Kaydediliyor..." : "Tüm şablonları kaydet"}
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
  meta,
  initial,
  accent,
}: {
  meta: TemplateMeta
  initial: { subject: string; body: string }
  accent: "user" | "admin"
}) {
  const accentClasses =
    accent === "user"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700"
  const accentLabel = accent === "user" ? "Kullanıcıya gider" : "Bize gider"
  const Icon = accent === "user" ? User : Inbox

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4">
      <div className="flex items-start gap-2">
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${accentClasses}`}
        >
          <Icon size={11} />
          {accentLabel}
        </span>
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          {meta.label}
        </div>
        <p className="mt-0.5 text-[11.5px] leading-snug text-black/55">
          {meta.description}
        </p>
      </div>

      <TemplateInputs
        templateKey={meta.key}
        initial={initial}
        placeholders={meta.placeholders}
      />
    </div>
  )
}

function TemplateInputs({
  templateKey,
  initial,
  placeholders,
}: {
  templateKey: TemplateKey
  initial: { subject: string; body: string }
  placeholders: string[]
}) {
  return (
    <div className="flex flex-col gap-3">
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
        <span className="text-[11.5px] font-medium text-black/55">Gövde</span>
        <textarea
          name={`${templateKey}__body`}
          required
          rows={9}
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
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

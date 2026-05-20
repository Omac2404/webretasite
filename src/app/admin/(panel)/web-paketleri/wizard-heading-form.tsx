"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { WizardHeading } from "@/lib/web-packages-types"
import { saveWizardHeadingAction, type SaveState } from "./actions"

export function WizardHeadingForm({ initial }: { initial: WizardHeading }) {
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveWizardHeadingAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          label="Başlığın ilk kısmı (normal ağırlık)"
          hint="Örn: &quot;Projenize özel&quot;"
        >
          <input
            name="titleLeader"
            type="text"
            defaultValue={initial.titleLeader}
            className={fieldInput}
          />
        </Field>
        <Field
          label="Başlığın vurgulu kısmı (bold mavi)"
          hint="Örn: &quot;fiyat teklifi&quot;"
        >
          <input
            name="titleHighlight"
            type="text"
            defaultValue={initial.titleHighlight}
            className={fieldInput}
          />
        </Field>
      </div>
      <Field label="Alt metin">
        <textarea
          name="subtitle"
          defaultValue={initial.subtitle}
          rows={2}
          className={`${fieldInput} resize-none`}
        />
      </Field>
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
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      {children}
    </label>
  )
}

const fieldInput =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

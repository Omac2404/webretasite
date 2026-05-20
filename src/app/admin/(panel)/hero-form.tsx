"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { saveHeroAction, type SaveHeroState } from "./actions"
import type { HeroData } from "@/lib/hero-store"

export function HeroForm({ initial }: { initial: HeroData }) {
  const [state, formAction, isPending] = useActionState<SaveHeroState, FormData>(
    saveHeroAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Başlık altı yazısı"
        hint="Ana başlığın hemen altında görünen tek paragraf."
      >
        <textarea
          name="subheadline"
          defaultValue={initial.subheadline}
          rows={3}
          required
          className="w-full resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-[#0a0a0a] focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ButtonGroup
          title="Birinci buton"
          labelName="primaryLabel"
          labelDefault={initial.primaryButton.label}
          hrefName="primaryHref"
          hrefDefault={initial.primaryButton.href}
        />
        <ButtonGroup
          title="İkinci buton"
          labelName="secondaryLabel"
          labelDefault={initial.secondaryButton.label}
          hrefName="secondaryHref"
          hrefDefault={initial.secondaryButton.href}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Kaydet
        </button>
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
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/55">
        {label}
      </span>
      {hint && <span className="text-[12px] text-black/45">{hint}</span>}
      {children}
    </label>
  )
}

function ButtonGroup({
  title,
  labelName,
  labelDefault,
  hrefName,
  hrefDefault,
}: {
  title: string
  labelName: string
  labelDefault: string
  hrefName: string
  hrefDefault: string
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4">
      <div className="text-[12.5px] font-semibold text-[#0a0a0a]">{title}</div>
      <div className="mt-3 flex flex-col gap-3">
        <Field label="Buton yazısı">
          <input
            type="text"
            name={labelName}
            defaultValue={labelDefault}
            required
            className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
          />
        </Field>
        <Field label="Link" hint="Site içi yol veya tam URL.">
          <input
            type="text"
            name={hrefName}
            defaultValue={hrefDefault}
            required
            placeholder="/web-site"
            className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
          />
        </Field>
      </div>
    </div>
  )
}

"use client"

import { useActionState, useEffect, useState } from "react"
import { updateGlobalCtaAction, type UpdateState } from "./actions"
import { fieldInput, FormFooter } from "./channel-form"
import type { GlobalCta } from "@/lib/packages-types"

const INITIAL: UpdateState = {}

// /dijital-reklamlar sayfasının altındaki "Yurtdışı reklamları" CTA kartı
// için içerik formu. Tek dokümanlık — kanaldan bağımsız.
export function GlobalCtaForm({ cta }: { cta: GlobalCta }) {
  const [state, formAction, pending] = useActionState(
    updateGlobalCtaAction,
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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="Üst etiket"
        hint="Kartın sol üst köşesindeki küçük pill. Örn: Yurtdışı reklamları"
      >
        <input
          name="kicker"
          type="text"
          defaultValue={cta.kicker}
          className={fieldInput}
          placeholder="Yurtdışı reklamları"
        />
      </Field>

      <Field label="Başlık" hint="Büyük, vurgu metni.">
        <input
          name="title"
          type="text"
          defaultValue={cta.title}
          required
          className={fieldInput}
          placeholder="Globale satış mı yapmak istiyorsun?"
        />
      </Field>

      <Field
        label="Açıklama"
        hint="Başlığın altındaki kısa paragraf. 2-3 cümle önerilir."
      >
        <textarea
          name="body"
          defaultValue={cta.body}
          required
          rows={4}
          className={`${fieldInput} resize-y leading-relaxed`}
          placeholder="Avrupa, ABD ve MENA bölgelerine yönelik..."
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr]">
        <Field label="Buton metni">
          <input
            name="buttonLabel"
            type="text"
            defaultValue={cta.buttonLabel}
            required
            className={fieldInput}
            placeholder="İletişime geçin"
          />
        </Field>
        <Field label="Buton linki" hint="Genellikle /iletisim.">
          <input
            name="buttonHref"
            type="text"
            defaultValue={cta.buttonHref}
            className={fieldInput}
            placeholder="/iletisim"
          />
        </Field>
      </div>

      <FormFooter pending={pending} error={state.error} savedFlash={savedFlash} />
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

"use client"

import { useActionState, useEffect, useState } from "react"
import { updateWhatsAppAction, type UpdateState } from "./actions"
import { fieldInput, FormFooter } from "./channel-form"
import type { WhatsAppSettings } from "@/lib/packages-types"

const INITIAL: UpdateState = {}

export function WhatsAppForm({ whatsapp }: { whatsapp: WhatsAppSettings }) {
  const [state, formAction, pending] = useActionState(
    updateWhatsAppAction,
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="WhatsApp numarası (sadece rakam)"
          hint="wa.me'nin beklediği biçim. Örn: 905321234567"
        >
          <input
            name="number"
            type="text"
            inputMode="numeric"
            defaultValue={whatsapp.number}
            required
            className={fieldInput}
            placeholder="905321234567"
          />
        </Field>
        <Field
          label="Görünür biçim"
          hint="Paket detayında kullanıcıya gösterilen format."
        >
          <input
            name="display"
            type="text"
            defaultValue={whatsapp.display}
            required
            className={fieldInput}
            placeholder="+90 532 123 45 67"
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

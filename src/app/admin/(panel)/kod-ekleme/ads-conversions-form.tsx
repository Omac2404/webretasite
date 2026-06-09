"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { AdsConversionsSettings } from "@/lib/ads-conversions-types"
import { saveAdsConversionsAction, type SaveState } from "./actions"

export function AdsConversionsForm({
  initial,
}: {
  initial: AdsConversionsSettings
}) {
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveAdsConversionsAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex items-center gap-2.5 text-[13px] text-black/75">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial.enabled}
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        <span>Dönüşüm gönderimi aktif</span>
      </label>

      <Field
        label="Form gönderimi (lead)"
        hint="Teklif, iletişim ve randevu formu başarıyla gönderildiğinde sayılır."
      >
        <input
          name="formSendTo"
          type="text"
          defaultValue={initial.formSendTo}
          placeholder="AW-1234567890/AbCdEf…"
          className={fieldInput}
        />
      </Field>

      <Field
        label="WhatsApp tıklaması"
        hint="Paketlerdeki ve yüzen menüdeki WhatsApp butonlarına tıklanınca sayılır."
      >
        <input
          name="whatsappSendTo"
          type="text"
          defaultValue={initial.whatsappSendTo}
          placeholder="AW-1234567890/GhIjKl…"
          className={fieldInput}
        />
      </Field>

      <Field
        label="Telefon tıklaması"
        hint="İletişim sayfası ve yüzen menüdeki telefon/'hemen ara' tıklamasında sayılır."
      >
        <input
          name="phoneSendTo"
          type="text"
          defaultValue={initial.phoneSendTo}
          placeholder="AW-1234567890/MnOpQr…"
          className={fieldInput}
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
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] font-mono text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

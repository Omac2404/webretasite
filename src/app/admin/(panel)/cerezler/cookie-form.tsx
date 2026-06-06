"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { CookieConsentSettings } from "@/lib/cookie-consent-types"
import { saveCookieConsentAction, type SaveState } from "./actions"

const field =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 outline-none transition-colors focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"

export function CookieForm({ initial }: { initial: CookieConsentSettings }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveCookieConsentAction,
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
        Çerez bildirimi aktif
      </label>

      <Labeled label="Başlık">
        <input
          name="title"
          type="text"
          defaultValue={initial.title}
          maxLength={120}
          placeholder="Çerez Bildirimi"
          className={field}
        />
      </Labeled>

      <Labeled
        label="Bildirim metni"
        hint="Ziyaretçiye gösterilecek açıklama."
      >
        <textarea
          name="message"
          rows={3}
          defaultValue={initial.message}
          maxLength={600}
          className={`${field} resize-y`}
        />
      </Labeled>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Labeled label="Buton yazısı">
          <input
            name="buttonLabel"
            type="text"
            defaultValue={initial.buttonLabel}
            maxLength={40}
            placeholder="Tamam"
            className={field}
          />
        </Labeled>

        <Labeled
          label="Yeniden gösterme aralığı (saat)"
          hint="Kabul edildikten sonra tekrar çıkana kadar."
        >
          <input
            name="reshowHours"
            type="number"
            min={1}
            max={8760}
            defaultValue={initial.reshowHours}
            className={field}
          />
        </Labeled>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <Labeled
          label="Politika bağlantısı (opsiyonel)"
          hint="Örn: /yasal/cerez-politikasi"
        >
          <input
            name="policyUrl"
            type="text"
            defaultValue={initial.policyUrl}
            maxLength={300}
            placeholder="/yasal/cerez-politikasi"
            className={field}
          />
        </Labeled>

        <Labeled label="Bağlantı yazısı">
          <input
            name="policyLabel"
            type="text"
            defaultValue={initial.policyLabel}
            maxLength={60}
            placeholder="Çerez Politikası"
            className={field}
          />
        </Labeled>
      </div>

      <div className="flex items-center justify-end gap-3">
        {state.ok && !pending && (
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
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Kaydet
        </button>
      </div>
    </form>
  )
}

function Labeled({
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

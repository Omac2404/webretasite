"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { SiteCodeSettings } from "@/lib/site-code-types"
import { saveSiteCodeAction, type SaveState } from "./actions"

const mono =
  "w-full rounded-lg border border-black/[0.12] bg-[#fbfcfe] px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-[#0a0a0a] placeholder:text-black/25 outline-none transition-colors focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"

export function CodeForm({ initial }: { initial: SiteCodeSettings }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveSiteCodeAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <Slot
        toggleName="headEnabled"
        codeName="headCode"
        toggleLabel="Header kodu aktif"
        title="Header (<head>) kodu"
        hint="Search Console doğrulama meta etiketi, Google Ads/Analytics (gtag), Meta Pixel gibi sayfa başında çalışması gereken kodlar."
        placeholder={`<!-- Örn: Google Search Console -->\n<meta name="google-site-verification" content="..." />\n\n<!-- Örn: Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'AW-XXXX');\n</script>`}
        defaultEnabled={initial.headEnabled}
        defaultValue={initial.headCode}
      />

      <Slot
        toggleName="bodyEnabled"
        codeName="bodyCode"
        toggleLabel="Body kodu aktif"
        title="Body (</body> öncesi) kodu"
        hint="Sayfa sonunda yüklenmesi yeterli olan scriptler, sohbet widget'ları, dönüşüm/uzak API çağrıları."
        placeholder={`<!-- Sayfa sonuna eklenecek kodlar -->\n<script>\n  // ...\n</script>`}
        defaultEnabled={initial.bodyEnabled}
        defaultValue={initial.bodyCode}
      />

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

  function Slot({
    toggleName,
    codeName,
    toggleLabel,
    title,
    hint,
    placeholder,
    defaultEnabled,
    defaultValue,
  }: {
    toggleName: string
    codeName: string
    toggleLabel: string
    title: string
    hint: string
    placeholder: string
    defaultEnabled: boolean
    defaultValue: string
  }) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
          <label className="inline-flex items-center gap-2 text-[12.5px] text-black/70">
            <input
              type="checkbox"
              name={toggleName}
              defaultChecked={defaultEnabled}
              className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
            />
            {toggleLabel}
          </label>
        </div>
        <p className="text-[11.5px] leading-relaxed text-black/45">{hint}</p>
        <textarea
          name={codeName}
          rows={9}
          defaultValue={defaultValue}
          placeholder={placeholder}
          spellCheck={false}
          className={`${mono} resize-y`}
        />
      </div>
    )
  }
}

"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { addLegalPageAction, type AddLegalState } from "./actions"

const INITIAL: AddLegalState = {}

export function AddLegalPageForm() {
  const [state, formAction, pending] = useActionState(
    addLegalPageAction,
    INITIAL,
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11.5px] font-medium text-black/55">Başlık</span>
          <span className="text-[11px] text-black/40">
            URL otomatik bu başlıktan üretilir.
          </span>
        </div>
        <input
          name="title"
          type="text"
          required
          placeholder="Örn. Gizlilik Politikası"
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11.5px] font-medium text-black/55">Metin</span>
          <span className="text-[11px] text-black/40">
            Boş satır = paragraf ayracı. Tek satır boşluğu yeni satır olarak korunur.
          </span>
        </div>
        <textarea
          name="body"
          rows={14}
          required
          placeholder="Sayfanın gövdesi"
          className={`${inputCls} resize-y font-mono text-[12.5px] leading-relaxed`}
        />
      </label>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Ekleniyor..." : "Sayfayı ekle"}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

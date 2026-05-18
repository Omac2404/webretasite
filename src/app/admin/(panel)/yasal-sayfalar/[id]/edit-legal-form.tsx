"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import type { LegalPage } from "@/lib/legal-types"
import { updateLegalPageAction, type EditLegalState } from "../actions"

const INITIAL: EditLegalState = {}

export function EditLegalPageForm({ page }: { page: LegalPage }) {
  const [state, formAction, pending] = useActionState(
    updateLegalPageAction,
    INITIAL,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={page.id} />

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-black/55">Başlık</span>
        <input
          name="title"
          type="text"
          required
          defaultValue={page.title}
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11.5px] font-medium text-black/55">Metin</span>
          <span className="text-[11px] text-black/40">
            Boş satır = paragraf ayracı.
          </span>
        </div>
        <textarea
          name="body"
          rows={18}
          required
          defaultValue={page.body}
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
          {pending ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

"use client"

import { useActionState } from "react"
import { bulkImportAction, type RedirectFormState } from "./actions"

const INITIAL: RedirectFormState & { added?: number; skipped?: number } = {}

export function BulkImportForm() {
  const [state, formAction, pending] = useActionState(bulkImportAction, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="rows"
        rows={6}
        placeholder={"/eski-hizmetler,/hizmetler\n/2023/05/yazi,/blog/yeni-yazi\n/iletisim-bilgileri,/iletisim"}
        className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 font-mono text-[12.5px] text-[#0a0a0a] placeholder:text-black/30 outline-none transition-colors focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"
      />
      <p className="text-[11.5px] text-black/45">
        Her satıra bir kural:{" "}
        <code className="rounded bg-black/[0.05] px-1 py-0.5">/eski,/yeni</code>{" "}
        · virgül, tab veya <code className="rounded bg-black/[0.05] px-1 py-0.5">{"->"}</code>{" "}
        ile ayır. Hepsi tam eşleşme & 301 olarak eklenir; mevcut kaynaklar atlanır.
      </p>

      {state.ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12.5px] text-green-700">
          {state.added} kural eklendi
          {state.skipped ? `, ${state.skipped} satır atlandı` : ""}.
        </div>
      )}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg border border-black/[0.12] bg-white px-4 py-2.5 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.03] disabled:opacity-50"
        >
          {pending ? "İçe aktarılıyor..." : "Toplu içe aktar"}
        </button>
      </div>
    </form>
  )
}

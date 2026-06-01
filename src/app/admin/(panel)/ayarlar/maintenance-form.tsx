"use client"

import { useActionState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import type { SiteSettings } from "@/lib/site-settings-types"
import { setMaintenanceAction, type SaveState } from "./actions"

export function MaintenanceForm({
  initial,
}: {
  initial: SiteSettings["maintenance"]
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    setMaintenanceAction,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex items-center gap-2.5 text-[13px] text-black/75">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial.enabled}
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        Bakım modu aktif
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-black/55">
          Ziyaretçilere gösterilecek mesaj
        </span>
        <textarea
          name="message"
          rows={2}
          defaultValue={initial.message}
          maxLength={240}
          placeholder="Site bakımda, kısa süre içinde tekrar yayında olacak."
          className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
        />
      </label>

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

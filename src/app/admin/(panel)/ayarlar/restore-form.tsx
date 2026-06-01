"use client"

import { useActionState, useState } from "react"
import { Check, AlertCircle, Loader2, Upload } from "lucide-react"
import { restoreBackupAction, type SaveState } from "./actions"

export function RestoreForm() {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    restoreBackupAction,
    {},
  )
  const [filename, setFilename] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
        <strong>Dikkat:</strong> Geri yükleme mevcut <code>data/</code>{" "}
        dosyalarını yedektekilerle <em>üzerine yazar</em>. Önce mevcut durumu
        yedeklemen önerilir.
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-black/[0.15] bg-white px-3 py-2.5 text-[12.5px] text-black/65 transition-colors hover:border-[#3c639f]/40 hover:bg-[#3c639f]/[0.02]">
        <Upload size={14} className="text-[#3c639f]" />
        <span>{filename ?? "Yedek JSON dosyasını seç"}</span>
        <input
          type="file"
          name="backup"
          accept=".json,application/json"
          onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
          className="hidden"
        />
      </label>

      <label className="flex items-center gap-2 text-[12px] text-black/65">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        Mevcut verilerin üzerine yazılacağını anladım.
      </label>

      <div className="flex items-center justify-end gap-3">
        {state.ok && !pending && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
            <Check size={14} /> Geri yüklendi
          </span>
        )}
        {state.error && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
            <AlertCircle size={14} /> {state.error}
          </span>
        )}
        <button
          type="submit"
          disabled={pending || !filename || !confirmed}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Geri yükle
        </button>
      </div>
    </form>
  )
}

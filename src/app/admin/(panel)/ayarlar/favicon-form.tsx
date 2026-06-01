"use client"

import { useActionState, useState } from "react"
import { Check, AlertCircle, Loader2, Upload, RotateCcw } from "lucide-react"
import { resetFaviconAction, uploadFaviconAction, type SaveState } from "./actions"

export function FaviconForm({ currentUrl }: { currentUrl: string }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    uploadFaviconAction,
    {},
  )
  const [filename, setFilename] = useState<string | null>(null)
  const previewUrl = currentUrl || "/favicon.ico"

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.08] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Mevcut favicon"
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="text-[12px] text-black/55">
          <div className="font-medium text-[#0a0a0a]">Mevcut favicon</div>
          <div className="break-all">{currentUrl || "src/app/favicon.ico (varsayılan)"}</div>
        </div>
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-black/[0.15] bg-white px-3 py-2.5 text-[12.5px] text-black/65 transition-colors hover:border-[#3c639f]/40 hover:bg-[#3c639f]/[0.02]">
          <Upload size={14} className="text-[#3c639f]" />
          <span>{filename ?? "Yeni favicon seç (ICO, PNG, SVG, WebP — max 1 MB)"}</span>
          <input
            type="file"
            name="favicon"
            accept=".ico,.png,.svg,.webp,image/x-icon,image/png,image/svg+xml,image/webp"
            onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
            className="hidden"
          />
        </label>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {state.ok && !pending && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
              <Check size={14} /> Yüklendi
            </span>
          )}
          {state.error && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
              <AlertCircle size={14} /> {state.error}
            </span>
          )}
          {currentUrl && (
            <form action={resetFaviconAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[12px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
              >
                <RotateCcw size={13} />
                Varsayılana dön
              </button>
            </form>
          )}
          <button
            type="submit"
            disabled={pending || !filename}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}

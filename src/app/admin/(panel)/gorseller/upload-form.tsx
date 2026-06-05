"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { uploadMediaAction, type UploadMediaState } from "./actions"

const INITIAL: UploadMediaState = {}

export function UploadForm() {
  const [state, formAction, pending] = useActionState(uploadMediaAction, INITIAL)
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPreview(null)
      setFilename(null)
    }
  }, [state.ok])

  const field =
    "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/30 outline-none transition-colors focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        <label className="flex h-[92px] w-[140px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.18] bg-[#fafbfd] text-[12px] text-black/55 transition-colors hover:bg-black/[0.02]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Önizleme"
              className="max-h-[78px] max-w-[126px] rounded object-contain"
            />
          ) : (
            <>
              <Upload size={18} />
              <span>Görsel seç</span>
            </>
          )}
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            required
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) {
                setPreview(null)
                setFilename(null)
                return
              }
              setFilename(f.name)
              setPreview(URL.createObjectURL(f))
            }}
          />
        </label>

        <div className="flex flex-col gap-2">
          <input
            name="name"
            type="text"
            placeholder="Dosya adı (SEO için, örn: izmir-web-tasarim) — boşsa orijinal ad kullanılır"
            className={field}
          />
          <input
            name="alt"
            type="text"
            placeholder="Alt metni (görseli açıklayan kısa metin — SEO & erişilebilirlik)"
            className={field}
          />
          {filename && (
            <p className="text-[11.5px] text-black/45">
              Seçilen: {filename} — yüklenince otomatik WebP&apos;ye çevrilir.
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Yükleniyor..." : "Kütüphaneye yükle"}
        </button>
      </div>
    </form>
  )
}

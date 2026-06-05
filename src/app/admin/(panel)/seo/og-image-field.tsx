"use client"

import { useState, useTransition } from "react"
import { Upload, Loader2, X } from "lucide-react"
import { uploadOgImageAction } from "./actions"

// Default OG image control inside the global SEO form. The text input keeps
// name="defaultOgImage" so the parent form's single "Kaydet" persists it —
// upload just fills that input with the saved path. No nested <form>: the
// upload action is invoked imperatively from the file input's onChange.
export function OgImageField({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onPick(file: File | undefined) {
    if (!file) return
    setError(null)
    const fd = new FormData()
    fd.set("image", file)
    startTransition(async () => {
      const res = await uploadOgImageAction(fd)
      if (res.error) setError(res.error)
      else if (res.path) setValue(res.path)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11.5px] font-medium text-black/55">
        Varsayılan paylaşım görseli
      </span>
      <span className="text-[11px] text-black/40">
        OpenGraph / Twitter ve blog yapısal verisi için. Önerilen ölçü
        1200×630px. Görsel yükle veya tam URL / /public yolu yaz.
      </span>

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="flex h-[68px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.1] bg-[#fafbfd]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="OG önizleme"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[10.5px] text-black/30">Görsel yok</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            name="defaultOgImage"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="/og/og-cover.png veya https://..."
            className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
          />
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-black/[0.18] bg-white px-3 py-1.5 text-[12px] font-medium text-black/65 transition-colors hover:bg-black/[0.02]">
              {pending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {pending ? "Yükleniyor..." : "Görsel yükle"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={pending}
                onChange={(e) => onPick(e.target.files?.[0])}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-black/45 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={13} /> Kaldır
              </button>
            )}
          </div>
          {error && <p className="text-[11.5px] text-red-600">{error}</p>}
          <p className="text-[11px] text-black/35">
            Not: Değişikliğin kaydedilmesi için aşağıdaki <strong>Kaydet</strong>{" "}
            butonuna bas.
          </p>
        </div>
      </div>
    </div>
  )
}

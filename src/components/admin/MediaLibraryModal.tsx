"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Upload, Loader2, X, Check } from "lucide-react"
import type { MediaItem } from "@/lib/media-store"
import { uploadToLibraryAction } from "@/app/admin/(panel)/gorseller/actions"

// Shared "kütüphaneden seç ya da bilgisayardan yükle" dialog. Used by the
// MediaPicker (cover/logo selection) and the blog inline-image toolbar.
//
// - onUploaded: bubble a freshly uploaded item up so the parent can keep its
//   own copy of the library list in sync.
// - onSelect: the caller receives the chosen public URL (and the item).
export function MediaLibraryModal({
  open,
  onClose,
  items,
  selectedUrl,
  onUploaded,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  items: MediaItem[]
  selectedUrl?: string | null
  onUploaded: (item: MediaItem) => void
  onSelect: (item: MediaItem) => void
}) {
  const [query, setQuery] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const filtered = q
    ? items.filter((it) =>
        `${it.originalName} ${it.alt} ${it.url}`.toLowerCase().includes(q),
      )
    : items

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("hint", file.name)
      const res = await uploadToLibraryAction(fd)
      if (res.error || !res.item) {
        setError(res.error ?? "Yükleme başarısız.")
        return
      }
      onUploaded(res.item)
      onSelect(res.item)
      onClose()
    } catch {
      setError("Beklenmeyen bir hata oluştu.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.07] px-5 py-3.5">
          <div className="text-[14px] font-semibold text-[#0a0a0a]">
            Görsel kütüphanesi
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-7 w-7 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar: upload + search */}
        <div className="flex flex-col gap-2.5 border-b border-black/[0.06] px-5 py-3 sm:flex-row sm:items-center">
          <label
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium text-white transition-opacity ${
              uploading
                ? "cursor-not-allowed bg-[#3c639f]/60"
                : "cursor-pointer bg-[#3c639f] hover:opacity-90"
            }`}
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? "Yükleniyor..." : "Bilgisayardan yükle"}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ""
              }}
            />
          </label>

          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kütüphanede ara (ad, alt metni)…"
              className="w-full rounded-lg border border-black/[0.12] bg-white py-2 pl-9 pr-3 text-[13px] text-[#0a0a0a] placeholder:text-black/30 outline-none focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"
            />
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-black/45">
              {items.length === 0
                ? "Kütüphane boş. Yukarıdan ilk görselini yükle."
                : "Aramayla eşleşen görsel yok."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => {
                const active = selectedUrl === item.url
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item)
                      onClose()
                    }}
                    title={item.originalName || item.url}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                      active
                        ? "border-[#3c639f] ring-2 ring-[#3c639f]/25"
                        : "border-black/[0.08] hover:border-[#3c639f]/50"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#3c639f] text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div className="flex h-[110px] items-center justify-center bg-[#fafbfd] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt || item.originalName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="truncate border-t border-black/[0.05] px-2 py-1.5 text-[11px] text-black/55">
                      {item.originalName || item.url.replace("/media/", "")}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

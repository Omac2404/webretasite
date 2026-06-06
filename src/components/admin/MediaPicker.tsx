"use client"

import { useState } from "react"
import { ImagePlus, Images, X } from "lucide-react"
import type { MediaItem } from "@/lib/media-store"
import { MediaLibraryModal } from "./MediaLibraryModal"

// Reusable image field backed by the central media library. Renders a
// preview + a button that opens the library modal (pick existing OR upload
// from computer). The chosen public URL is mirrored into a hidden input so
// the surrounding <form> submits it under `name`, and `onChange` lets a
// parent mirror it into local state (e.g. live SEO preview).
export function MediaPicker({
  name,
  value = "",
  media,
  onChange,
  variant = "cover",
}: {
  name: string
  value?: string
  media: MediaItem[]
  onChange?: (url: string) => void
  variant?: "cover" | "logo"
}) {
  const [selected, setSelected] = useState(value)
  const [items, setItems] = useState<MediaItem[]>(media)
  const [open, setOpen] = useState(false)

  function update(url: string) {
    setSelected(url)
    onChange?.(url)
  }

  const previewBox =
    variant === "logo"
      ? "h-14 w-24"
      : "h-20 w-32"

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={selected} />

      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.08] bg-[#fafbfd] ${previewBox}`}
      >
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selected}
            alt="Seçilen görsel"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <ImagePlus size={18} className="text-black/25" />
        )}
      </div>

      <div className="flex flex-col items-start gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[12.5px] font-medium text-black/70 transition-colors hover:border-[#3c639f]/40 hover:text-[#3c639f]"
        >
          <Images size={14} />
          {selected ? "Görseli değiştir" : "Kütüphaneden seç / yükle"}
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => update("")}
            className="inline-flex items-center gap-1 text-[11.5px] text-black/45 transition-colors hover:text-red-600"
          >
            <X size={12} />
            Kaldır
          </button>
        )}
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        selectedUrl={selected}
        onUploaded={(item) => setItems((prev) => [item, ...prev])}
        onSelect={(item) => update(item.url)}
      />
    </div>
  )
}

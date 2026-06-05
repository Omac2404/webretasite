"use client"

import { useState } from "react"
import { Copy, Check, Trash2, Save } from "lucide-react"
import type { MediaItem } from "@/lib/media-store"
import { deleteMediaAction, updateMediaAltAction } from "./actions"

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function MediaCard({ item }: { item: MediaItem }) {
  const [copied, setCopied] = useState(false)
  const [alt, setAlt] = useState(item.alt)

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const isSvg = item.url.endsWith(".svg")

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/[0.07] bg-white">
      <div className="flex h-[140px] items-center justify-center border-b border-black/[0.05] bg-[#fafbfd] p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.alt || item.originalName}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <code className="truncate text-[11px] text-black/55" title={item.url}>
            {item.url.replace("/media/", "")}
          </code>
          <span className="shrink-0 rounded bg-black/[0.05] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.06em] text-black/45">
            {isSvg ? "SVG" : "WebP"}
          </span>
        </div>

        <div className="text-[10.5px] text-black/40">
          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
          {formatSize(item.size)}
        </div>

        {/* Alt text — inline editable for SEO */}
        <form action={updateMediaAltAction} className="flex items-center gap-1.5">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt metni"
            className="min-w-0 flex-1 rounded-md border border-black/[0.1] bg-white px-2 py-1 text-[11.5px] text-[#0a0a0a] placeholder:text-black/30 outline-none focus:border-[#3c639f] focus:ring-1 focus:ring-[#3c639f]/20"
          />
          <button
            type="submit"
            title="Alt metnini kaydet"
            aria-label="Alt metnini kaydet"
            disabled={alt === item.alt}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-black/50 transition-colors hover:bg-black/[0.05] hover:text-[#3c639f] disabled:opacity-30"
          >
            <Save size={13} />
          </button>
        </form>

        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-black/[0.1] bg-white px-2 py-1.5 text-[11.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.04]"
          >
            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            {copied ? "Kopyalandı" : "URL kopyala"}
          </button>
          <form action={deleteMediaAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              title="Sil"
              aria-label="Sil"
              className="flex h-[30px] w-8 items-center justify-center rounded-md border border-black/[0.1] bg-white text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Loader2, Upload } from "lucide-react"
import { authorInitials, type Author } from "@/lib/authors-types"
import { updateAuthorAction, type AuthorState } from "../actions"

const INITIAL: AuthorState = {}

export function EditAuthorForm({ author }: { author: Author }) {
  const [state, formAction, pending] = useActionState(
    updateAuthorAction,
    INITIAL,
  )
  const [preview, setPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true)
      const t = setTimeout(() => setSavedFlash(false), 1800)
      return () => clearTimeout(t)
    }
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={author.id} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Ad Soyad
          </span>
          <input
            name="name"
            type="text"
            required
            defaultValue={author.name}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Uzmanlık
          </span>
          <input
            name="expertise"
            type="text"
            required
            defaultValue={author.expertise}
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-black/55">
          Profil fotoğrafı
        </span>
        <div className="flex items-center gap-3">
          {/* Current photo or initials fallback — always shown so the
              admin can see what's currently saved */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-black/[0.08] bg-white">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Yeni"
                className="h-full w-full object-cover"
              />
            ) : author.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.photo}
                alt={author.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[16px] font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #5b8de6 0%, #3c639f 100%)",
                }}
              >
                {authorInitials(author.name)}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-black/[0.15] bg-white px-3 py-2.5 text-[13px] text-black/60 transition-colors hover:bg-black/[0.02]">
            <Upload size={14} />
            <span className="truncate">
              {filename ?? "Yeni fotoğraf seç (opsiyonel)"}
            </span>
            <input
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
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
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-h-[28px] flex-1">
          {state.error && (
            <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] text-red-700">
              {state.error}
            </div>
          )}
          {!state.error && savedFlash && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] text-emerald-700">
              <Check size={13} strokeWidth={2.5} />
              Kaydedildi
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

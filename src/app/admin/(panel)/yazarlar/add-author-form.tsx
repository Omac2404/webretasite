"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { addAuthorAction, type AuthorState } from "./actions"

const INITIAL: AuthorState = {}

export function AddAuthorForm() {
  const [state, formAction, pending] = useActionState(addAuthorAction, INITIAL)
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

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="name"
          type="text"
          required
          placeholder="Ad Soyad"
          className={inputCls}
        />
        <input
          name="expertise"
          type="text"
          required
          placeholder="Uzmanlık (örn. Senior Developer)"
          className={inputCls}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-black/[0.15] bg-white px-3 py-2.5 text-[13px] text-black/60 transition-colors hover:bg-black/[0.02]">
          <Upload size={14} />
          <span className="truncate">{filename ?? "Profil fotoğrafı"}</span>
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
        {preview && (
          <div className="h-12 w-12 overflow-hidden rounded-full border border-black/[0.08] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Önizleme"
              className="h-full w-full object-cover"
            />
          </div>
        )}
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Ekleniyor..." : "Yazarı ekle"}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

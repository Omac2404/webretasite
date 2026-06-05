"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { addRedirectAction, type RedirectFormState } from "./actions"
import type { MatchType } from "@/lib/redirects-store"

const INITIAL: RedirectFormState = {}

const TYPE_HINT: Record<MatchType, string> = {
  exact: "Tam eşleşme — sadece bu adres yönlendirilir.",
  prefix: "Önek — bu adres ve altındaki tüm yollar yönlendirilir.",
  regex: "Regex — desen eşleşmesi; hedefte $1, $2 kullanılabilir.",
}

export function AddRedirectForm() {
  const [state, formAction, pending] = useActionState(addRedirectAction, INITIAL)
  const [matchType, setMatchType] = useState<MatchType>("exact")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setMatchType("exact")
    }
  }, [state.ok])

  const field =
    "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/30 outline-none transition-colors focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
            Kaynak (eski adres)
          </label>
          <input
            name="source"
            type="text"
            required
            placeholder={matchType === "regex" ? "^/blog/(.*)$" : "/eski-sayfa"}
            className={field}
          />
        </div>
        <ArrowRight size={16} className="mx-auto mt-5 hidden shrink-0 text-black/30 sm:block" />
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
            Hedef (yeni adres)
          </label>
          <input
            name="destination"
            type="text"
            required
            placeholder={matchType === "regex" ? "/blog/$1" : "/yeni-sayfa"}
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
          Eşleşme tipi
        </label>
        <div className="flex flex-wrap gap-2">
          {(["exact", "prefix", "regex"] as MatchType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMatchType(t)}
              className={
                matchType === t
                  ? "rounded-lg border-2 border-[#3c639f] bg-[#3c639f]/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-[#3c639f]"
                  : "rounded-lg border-2 border-transparent bg-black/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-black/60 transition-colors hover:bg-black/[0.05]"
              }
            >
              {t === "exact" ? "Tam" : t === "prefix" ? "Önek" : "Regex"}
            </button>
          ))}
        </div>
        <input type="hidden" name="matchType" value={matchType} />
        <p className="text-[11.5px] text-black/45">{TYPE_HINT[matchType]}</p>
      </div>

      <div className="flex flex-wrap gap-5 pt-1">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[#0a0a0a]">
          <input
            type="checkbox"
            name="permanent"
            defaultChecked
            className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]"
          />
          Kalıcı (301)
          <span className="text-[11px] font-normal text-black/40">
            kapatırsan 302 (test için)
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[#0a0a0a]">
          <input
            type="checkbox"
            name="preserveQuery"
            className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]"
          />
          Sorgu parametrelerini koru
        </label>
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
          className="inline-flex items-center justify-center rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Ekleniyor..." : "Yönlendirme ekle"}
        </button>
      </div>
    </form>
  )
}

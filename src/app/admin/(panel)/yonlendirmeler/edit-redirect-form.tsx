"use client"

import { useActionState, useState } from "react"
import { updateRedirectAction, type RedirectFormState } from "./actions"
import type { MatchType, Redirect } from "@/lib/redirects-store"

const INITIAL: RedirectFormState = {}

// Inline edit panel revealed under a redirect row. Pre-filled with the
// rule's current values; submits through updateRedirectAction.
export function EditRedirectForm({ rule }: { rule: Redirect }) {
  const [state, formAction, pending] = useActionState(updateRedirectAction, INITIAL)
  const [matchType, setMatchType] = useState<MatchType>(rule.matchType)

  const field =
    "w-full rounded-md border border-black/[0.12] bg-white px-2.5 py-1.5 text-[12.5px] text-[#0a0a0a] outline-none focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"

  return (
    <form action={formAction} className="flex flex-col gap-2.5 border-t border-black/[0.06] bg-[#fafbfd] p-3">
      <input type="hidden" name="id" value={rule.id} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/45">
            Kaynak
          </label>
          <input name="source" type="text" defaultValue={rule.source} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/45">
            Hedef
          </label>
          <input name="destination" type="text" defaultValue={rule.destination} className={field} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="matchType" value={matchType} />
        <div className="flex gap-1.5">
          {(["exact", "prefix", "regex"] as MatchType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMatchType(t)}
              className={
                matchType === t
                  ? "rounded-md border border-[#3c639f] bg-[#3c639f]/[0.06] px-2.5 py-1 text-[11.5px] font-medium text-[#3c639f]"
                  : "rounded-md border border-black/[0.1] bg-white px-2.5 py-1 text-[11.5px] font-medium text-black/55 hover:bg-black/[0.03]"
              }
            >
              {t === "exact" ? "Tam" : t === "prefix" ? "Önek" : "Regex"}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[#0a0a0a]">
          <input type="checkbox" name="permanent" defaultChecked={rule.permanent} className="h-3.5 w-3.5 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]" />
          301
        </label>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[#0a0a0a]">
          <input type="checkbox" name="preserveQuery" defaultChecked={rule.preserveQuery} className="h-3.5 w-3.5 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]" />
          Sorguyu koru
        </label>
      </div>

      {state.error && <p className="text-[11.5px] text-red-600">{state.error}</p>}
      {state.ok && <p className="text-[11.5px] text-green-600">Kaydedildi.</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#3c639f] px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  )
}

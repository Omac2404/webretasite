"use client"

import { useActionState } from "react"
import { ArrowRight } from "lucide-react"
import { mapNotFoundAction, type RedirectFormState } from "./actions"

const INITIAL: RedirectFormState = {}

// Inline form on a "haritalanmamış 404" row: type the destination and
// create an exact 301 for the source path, removing it from the log.
export function MapNotFoundForm({ source }: { source: string }) {
  const [state, formAction, pending] = useActionState(mapNotFoundAction, INITIAL)

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input type="hidden" name="source" value={source} />
        <ArrowRight size={14} className="shrink-0 text-black/30" />
        <input
          name="destination"
          type="text"
          required
          placeholder="/yeni-hedef"
          className="w-44 rounded-md border border-black/[0.12] bg-white px-2.5 py-1.5 text-[12.5px] text-[#0a0a0a] placeholder:text-black/30 outline-none focus:border-[#3c639f] focus:ring-2 focus:ring-[#3c639f]/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-[#3c639f] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "..." : "Yönlendir"}
        </button>
      </div>
      {state.error && (
        <p className="text-[11.5px] text-red-600">{state.error}</p>
      )}
    </form>
  )
}

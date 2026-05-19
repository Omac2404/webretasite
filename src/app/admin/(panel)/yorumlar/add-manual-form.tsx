"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"
import { addManualReviewAction, type AddManualState } from "./actions"

const INITIAL: AddManualState = {}

export function AddManualForm() {
  const [state, formAction, pending] = useActionState(
    addManualReviewAction,
    INITIAL,
  )
  const [rating, setRating] = useState<number>(5)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setRating(5)
    }
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="rating" value={rating} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
        <input
          name="author"
          type="text"
          required
          placeholder="İsim (örn. Ayşe Kaya)"
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3c639f]"
        />
        <input
          name="date"
          type="text"
          placeholder="Tarih (örn. 12 Mart 2025)"
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3c639f]"
        />
      </div>

      <textarea
        name="text"
        required
        rows={3}
        placeholder="Yorum metni..."
        className="resize-y rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3c639f]"
      />

      <input
        name="sourceUrl"
        type="url"
        placeholder="Yorumun orijinal linki (opsiyonel — https://...)"
        className="rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3c639f]"
      />

      <div className="flex items-center gap-3">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-black/45">
          Yıldız
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-0.5"
              aria-label={`${n} yıldız`}
            >
              <Star
                size={20}
                className={
                  n <= rating
                    ? "fill-[#fbbf24] text-[#fbbf24]"
                    : "text-black/20"
                }
              />
            </button>
          ))}
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
          className="inline-flex items-center justify-center rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Ekleniyor..." : "Yorumu ekle"}
        </button>
      </div>
    </form>
  )
}

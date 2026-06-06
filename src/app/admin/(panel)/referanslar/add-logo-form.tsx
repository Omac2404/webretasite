"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Zap, Snail } from "lucide-react"
import type { MediaItem } from "@/lib/media-store"
import { MediaPicker } from "@/components/admin/MediaPicker"
import { addLogoAction, type AddLogoState } from "./actions"

const INITIAL: AddLogoState = {}

export function AddLogoForm({ media }: { media: MediaItem[] }) {
  const [state, formAction, pending] = useActionState(addLogoAction, INITIAL)
  const [row, setRow] = useState<"a" | "b">("a")
  // Bumping a key remounts MediaPicker so its selection clears after submit.
  const [pickerKey, setPickerKey] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)

  // Clear inputs + preview after a successful submit.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setRow("a")
      setPickerKey((k) => k + 1)
    }
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="row" value={row} />

      <input
        name="name"
        type="text"
        required
        placeholder="Firma ismi"
        className="rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] outline-none transition-colors focus:border-[#3c639f]"
      />

      <div className="flex flex-col gap-1.5">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-black/45">
          Logo görseli
        </div>
        <MediaPicker
          key={pickerKey}
          name="imageUrl"
          media={media}
          variant="logo"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-black/45">
          Hangi sırada aksın?
        </div>
        <div className="flex gap-2">
          <RowChip
            active={row === "a"}
            onClick={() => setRow("a")}
            icon={<Zap size={13} />}
            title="Üst sıra"
            subtitle="Hızlı"
          />
          <RowChip
            active={row === "b"}
            onClick={() => setRow("b")}
            icon={<Snail size={13} />}
            title="Alt sıra"
            subtitle="Yavaş"
          />
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
          {pending ? "Ekleniyor..." : "Logoyu ekle"}
        </button>
      </div>
    </form>
  )
}

function RowChip({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-2 rounded-lg border-2 border-[#3c639f] bg-[#3c639f]/[0.06] px-3 py-2 text-left text-[12.5px]"
          : "flex items-center gap-2 rounded-lg border-2 border-transparent bg-black/[0.03] px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-black/[0.05]"
      }
    >
      <span className={active ? "text-[#3c639f]" : "text-black/55"}>{icon}</span>
      <span>
        <span
          className={
            active
              ? "block font-semibold text-[#3c639f]"
              : "block font-semibold text-[#0a0a0a]"
          }
        >
          {title}
        </span>
        <span className="block text-[10.5px] text-black/45">{subtitle}</span>
      </span>
    </button>
  )
}

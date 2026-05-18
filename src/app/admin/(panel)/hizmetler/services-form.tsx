"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Code2, Loader2, TrendingUp } from "lucide-react"
import {
  MAX_BULLETS_PER_CARD,
  SERVICE_LABELS,
  type ServiceCard,
  type ServiceKey,
} from "@/lib/services-types"
import { saveServicesAction, type ServicesFormState } from "./actions"

const INITIAL: ServicesFormState = {}

// Padded copy of a card's bullets so the form always renders exactly
// MAX_BULLETS_PER_CARD input rows. Empty entries are dropped on submit.
function padBullets(bullets: string[]): string[] {
  const out = [...bullets]
  while (out.length < MAX_BULLETS_PER_CARD) out.push("")
  return out.slice(0, MAX_BULLETS_PER_CARD)
}

const CARD_ICONS: Record<ServiceKey, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  web: Code2,
  reklam: TrendingUp,
}

export function ServicesForm({ cards }: { cards: ServiceCard[] }) {
  const [state, formAction, pending] = useActionState(
    saveServicesAction,
    INITIAL,
  )
  // Saved-state acknowledgment fades out after a couple of seconds so
  // the admin doesn't have to click anywhere to dismiss it.
  const [showSaved, setShowSaved] = useState(false)
  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <CardEditor key={card.key} card={card} />
        ))}
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
        </button>
        {showSaved && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700">
            <Check size={14} />
            Kaydedildi
          </span>
        )}
      </div>
    </form>
  )
}

function CardEditor({ card }: { card: ServiceCard }) {
  const Icon = CARD_ICONS[card.key]
  const bullets = padBullets(card.bullets)

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3c639f]/[0.08]">
          <Icon size={16} className="text-[#3c639f]" strokeWidth={1.75} />
        </div>
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          {SERVICE_LABELS[card.key]} kartı
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Field
          label="Başlık"
          hint="Karttaki büyük yazı (örn. 'Web Site')."
        >
          <input
            name={`${card.key}__title`}
            type="text"
            required
            defaultValue={card.title}
            placeholder="Kart başlığı"
            className={inputCls}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11.5px] font-medium text-black/55">
              Alt maddeler
            </span>
            <span className="text-[11px] text-black/40">
              Boş bıraktıkların kartta gözükmez · en fazla {MAX_BULLETS_PER_CARD} madde
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {bullets.map((value, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-black/[0.08] bg-[#fafbfd] px-2.5 py-1.5"
              >
                <Check size={14} className="shrink-0 text-[#3c639f]" strokeWidth={2.5} />
                <input
                  name={`${card.key}__bullet_${idx}`}
                  type="text"
                  defaultValue={value}
                  placeholder={`${idx + 1}. madde${idx === 0 ? " (zorunlu)" : ""}`}
                  className="w-full bg-transparent text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-black/55">{label}</span>
        {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2.5 text-[13px] text-[#0a0a0a] placeholder:text-black/35 outline-none transition-colors focus:border-[#3c639f]"

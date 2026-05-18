"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"

export type PickerItem = { value: string; label: string; hint?: string }

// Controlled list-builder used by the footer form for both the nav
// picker and the legal-pages picker. The admin moves items between two
// stacks: "Şu an gösterilenler" (ordered) and "Eklenebilir" (the rest).
// On submit we serialise the selected stack as repeated hidden inputs
// with the same name — `formData.getAll(name)` reconstructs the order.
export function OrderedPicker({
  name,
  label,
  hint,
  items,
  initialSelected,
  emptySelectedHint,
  emptyAvailableHint,
}: {
  name: string
  label: string
  hint?: string
  items: PickerItem[]
  initialSelected: string[]
  emptySelectedHint?: string
  emptyAvailableHint?: string
}) {
  const byValue = useMemo(
    () => new Map(items.map((it) => [it.value, it])),
    [items],
  )
  // Only keep selected values that still exist in `items` — a legal page
  // that was deleted shouldn't ghost-render in the picker.
  const [selected, setSelected] = useState<string[]>(() =>
    initialSelected.filter((v) => byValue.has(v)),
  )
  const available = useMemo(
    () => items.filter((it) => !selected.includes(it.value)),
    [items, selected],
  )

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= selected.length) return
    const next = [...selected]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSelected(next)
  }

  function remove(value: string) {
    setSelected((cur) => cur.filter((v) => v !== value))
  }

  function add(value: string) {
    setSelected((cur) => (cur.includes(value) ? cur : [...cur, value]))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] font-medium text-black/55">{label}</span>
        {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      </div>

      <div className="rounded-lg border border-black/[0.10] bg-white p-3">
        {/* Hidden inputs — order matters; FormData.getAll preserves it. */}
        {selected.map((value) => (
          <input key={value} type="hidden" name={name} value={value} />
        ))}

        <div className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/40">
          Şu an gösterilenler
        </div>
        {selected.length === 0 ? (
          <p className="mt-2 text-[12px] text-black/45">
            {emptySelectedHint ?? "Henüz seçim yapmadın."}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {selected.map((value, idx) => {
              const item = byValue.get(value)
              if (!item) return null
              return (
                <li
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-black/[0.08] bg-[#fafbfd] px-2 py-1.5"
                >
                  <span className="flex h-5 min-w-[18px] items-center justify-center rounded bg-[#3c639f]/[0.10] text-[10.5px] font-semibold text-[#3c639f]">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#0a0a0a]">
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="hidden truncate text-[11px] text-black/40 sm:inline">
                      {item.hint}
                    </span>
                  )}
                  <IconBtn
                    label="Yukarı taşı"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                  >
                    <ChevronUp size={13} />
                  </IconBtn>
                  <IconBtn
                    label="Aşağı taşı"
                    onClick={() => move(idx, 1)}
                    disabled={idx === selected.length - 1}
                  >
                    <ChevronDown size={13} />
                  </IconBtn>
                  <IconBtn
                    label="Listeden çıkar"
                    onClick={() => remove(value)}
                    variant="danger"
                  >
                    <X size={13} />
                  </IconBtn>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-4 h-px bg-black/[0.06]" />

        <div className="mt-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/40">
          Eklenebilir
        </div>
        {available.length === 0 ? (
          <p className="mt-2 text-[12px] text-black/45">
            {emptyAvailableHint ?? "Eklenebilir başka öğe yok."}
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {available.map((it) => (
              <li key={it.value}>
                <button
                  type="button"
                  onClick={() => add(it.value)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.10] bg-white px-2.5 py-1 text-[12px] text-black/70 transition-colors hover:border-[#3c639f]/30 hover:text-[#3c639f]"
                >
                  <Plus size={12} />
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled = false,
  variant = "default",
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "danger"
}) {
  const base =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors"
  const enabled =
    variant === "danger"
      ? "text-black/40 hover:bg-red-50 hover:text-red-600"
      : "text-black/55 hover:bg-black/[0.05] hover:text-[#0a0a0a]"
  const dim = "cursor-not-allowed text-black/20"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${base} ${disabled ? dim : enabled}`}
    >
      {children}
    </button>
  )
}

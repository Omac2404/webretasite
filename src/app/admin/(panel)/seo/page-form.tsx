"use client"

import { useActionState, useState } from "react"
import { Check, AlertCircle, Loader2, ChevronDown } from "lucide-react"
import {
  CHANGE_FREQS,
  SEO_MANAGED_PAGES,
  type PageSeo,
} from "@/lib/seo-types"
import { savePageSeoAction, type SaveState } from "./actions"

export function PageSeoList({
  pages,
}: {
  pages: Record<string, PageSeo>
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {SEO_MANAGED_PAGES.map((p) => (
        <PageSeoRow
          key={p.href}
          href={p.href}
          label={p.label}
          initial={pages[p.href]}
        />
      ))}
    </div>
  )
}

function PageSeoRow({
  href,
  label,
  initial,
}: {
  href: string
  label: string
  initial: PageSeo
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    savePageSeoAction,
    {},
  )

  return (
    <div className="rounded-xl border border-black/[0.08] bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-[13px] font-medium text-[#0a0a0a]">{label}</div>
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[11px] text-black/55">
            {href}
          </code>
          {initial.noindex && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10.5px] font-medium text-red-700">
              noindex
            </span>
          )}
          {!initial.includeInSitemap && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-700">
              sitemap dışı
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-black/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <form action={formAction} className="flex flex-col gap-4 border-t border-black/[0.06] p-4">
          <input type="hidden" name="href" value={href} />

          <Field label="Başlık (title)">
            <input
              name="title"
              type="text"
              defaultValue={initial.title}
              placeholder="Boş bırakırsan varsayılan başlık kullanılır."
              className={inputCls}
            />
          </Field>

          <Field label="Açıklama (description)">
            <textarea
              name="description"
              rows={2}
              defaultValue={initial.description}
              placeholder="Boş bırakırsan varsayılan açıklama kullanılır."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field
            label="Anahtar kelimeler"
            hint="Virgül veya satır ile ayır."
          >
            <textarea
              name="keywords"
              rows={2}
              defaultValue={initial.keywords.join(", ")}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field
            label="OG / paylaşım görseli"
            hint="Boş bırakırsan varsayılan görsel kullanılır."
          >
            <input
              name="ogImage"
              type="text"
              defaultValue={initial.ogImage}
              placeholder="/brand/og-cover.png"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sitemap önceliği (0–1)">
              <input
                name="priority"
                type="number"
                min={0}
                max={1}
                step={0.1}
                defaultValue={initial.priority}
                className={inputCls}
              />
            </Field>
            <Field label="Değişim sıklığı">
              <select
                name="changefreq"
                defaultValue={initial.changefreq}
                className={inputCls}
              >
                {CHANGE_FREQS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <Toggle
              name="includeInSitemap"
              label="Sitemap'e dahil et"
              defaultChecked={initial.includeInSitemap}
            />
            <Toggle
              name="noindex"
              label="noindex (arama motorlarına gösterme)"
              defaultChecked={initial.noindex}
            />
          </div>

          <SubmitRow state={state} pending={pending} />
        </form>
      )}
    </div>
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
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      {children}
    </label>
  )
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string
  label: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] text-black/70">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
      />
      {label}
    </label>
  )
}

function SubmitRow({
  state,
  pending,
}: {
  state: SaveState
  pending: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      {state.ok && !pending && (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700">
          <Check size={14} /> Kaydedildi
        </span>
      )}
      {state.error && (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-red-600">
          <AlertCircle size={14} /> {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        Kaydet
      </button>
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

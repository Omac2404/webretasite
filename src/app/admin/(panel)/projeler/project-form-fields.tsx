"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Logo } from "@/lib/logos-store"
import {
  PROJECT_CATEGORIES,
  deriveInitials,
  type Project,
  type ProjectCategory,
} from "@/lib/projects-types"

// Shared field block used by both the add form and the edit form. The
// parent owns the `useActionState` hook and just passes us the action,
// state, and a default-values bundle for the edit case.

export type ProjectFormDefaults = Partial<
  Pick<
    Project,
    | "companyId"
    | "category"
    | "type"
    | "publishDate"
    | "demand"
    | "solution"
    | "demandDetail"
    | "solutionDetail"
    | "siteUrl"
  >
>

export function ProjectFormFields({
  logos,
  defaults,
  submitting,
  submitLabel,
  pendingLabel,
}: {
  logos: Logo[]
  defaults?: ProjectFormDefaults
  submitting: boolean
  submitLabel: string
  pendingLabel: string
}) {
  const sortedLogos = useMemo(
    () => [...logos].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [logos],
  )
  const [companyId, setCompanyId] = useState<string>(
    defaults?.companyId ?? sortedLogos[0]?.id ?? "",
  )
  const selected = sortedLogos.find((l) => l.id === companyId) ?? null

  // Date can be entered as a full day/month/year OR just a year. Pick the
  // initial mode from the existing value's shape, and seed each input so
  // switching modes keeps a sensible default.
  const initialDate = defaults?.publishDate ?? ""
  const [dateMode, setDateMode] = useState<"full" | "year">(
    /^\d{4}$/.test(initialDate) ? "year" : "full",
  )
  const fullDateDefault = /^\d{4}-\d{2}-\d{2}$/.test(initialDate)
    ? initialDate
    : ""
  const yearDefault = /^\d{4}$/.test(initialDate)
    ? initialDate
    : /^\d{4}-\d{2}-\d{2}$/.test(initialDate)
      ? initialDate.slice(0, 4)
      : ""

  if (sortedLogos.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-[13px] text-amber-900">
        Önce <a
          href="/admin/referanslar"
          className="font-medium underline underline-offset-2 hover:text-amber-700"
        >
          Referanslar
        </a>{" "}
        sekmesinden bir firma eklemelisin. Proje girerken oradan seçim
        yapacaksın.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Firma" hint="Referanslar sekmesindeki listeden seç.">
        <select
          name="companyId"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          {sortedLogos.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {selected && <SelectedCompanyPreview logo={selected} />}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Kategori">
          <select
            name="category"
            required
            defaultValue={defaults?.category ?? "dev"}
            className={`${inputCls} appearance-none`}
          >
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tip" hint='Kartta sağ üstte gözüken chip — örn. "Web Sitesi".'>
          <input
            name="type"
            type="text"
            required
            defaultValue={defaults?.type ?? ""}
            placeholder="Web Sitesi"
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label="Yayın tarihi"
        hint="Tam tarih ya da sadece yıl — kartta o şekilde gözükür."
      >
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            <DateModeBtn
              active={dateMode === "full"}
              onClick={() => setDateMode("full")}
            >
              Tam tarih
            </DateModeBtn>
            <DateModeBtn
              active={dateMode === "year"}
              onClick={() => setDateMode("year")}
            >
              Sadece yıl
            </DateModeBtn>
          </div>
          {dateMode === "full" ? (
            <input
              key="full"
              name="publishDate"
              type="date"
              required
              defaultValue={fullDateDefault}
              className={inputCls}
            />
          ) : (
            <input
              key="year"
              name="publishDate"
              type="number"
              required
              min={1900}
              max={2200}
              step={1}
              placeholder="2025"
              defaultValue={yearDefault}
              className={inputCls}
            />
          )}
        </div>
      </Field>

      <Field
        label="Kısa talep"
        hint="Kart üzerinde 'Talep' rozetinin yanında görünür — tek satır kalsın."
      >
        <input
          name="demand"
          type="text"
          required
          defaultValue={defaults?.demand ?? ""}
          placeholder="Müşterinin tek cümlelik isteği"
          className={inputCls}
        />
      </Field>

      <Field
        label="Kısa çözüm"
        hint="Kart üzerinde 'Çözüm' rozetinin yanında görünür — tek satır kalsın."
      >
        <input
          name="solution"
          type="text"
          required
          defaultValue={defaults?.solution ?? ""}
          placeholder="Sunduğunuz çözümün özeti"
          className={inputCls}
        />
      </Field>

      <Field
        label="Detaylı talep"
        hint="Üzerine gelince açılan pop-up'ta tam metin olarak okunur."
      >
        <textarea
          name="demandDetail"
          rows={4}
          required
          defaultValue={defaults?.demandDetail ?? ""}
          placeholder="Müşterinin durumu ve isteği — birkaç cümle"
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </Field>

      <Field
        label="Detaylı çözüm"
        hint="Üzerine gelince açılan pop-up'ta tam metin olarak okunur."
      >
        <textarea
          name="solutionDetail"
          rows={4}
          required
          defaultValue={defaults?.solutionDetail ?? ""}
          placeholder="Geliştirdiğiniz çözümün detayı ve sonuç"
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </Field>

      <Field
        label="Proje linki"
        hint="Opsiyonel — pop-up'ta 'Projeyi gör' butonu olarak açılır (yeni sekme)."
      >
        <input
          name="siteUrl"
          type="text"
          inputMode="url"
          defaultValue={defaults?.siteUrl ?? ""}
          placeholder="https://ornek-proje.com"
          className={inputCls}
        />
      </Field>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? pendingLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}

function SelectedCompanyPreview({ logo }: { logo: Logo }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border border-black/[0.06] bg-[#fafbfd] p-3">
      <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/[0.06] bg-white">
        {logo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.imageUrl}
            alt={logo.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[13px] font-bold tracking-tight text-[#3c639f]">
            {deriveInitials(logo.name)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#0a0a0a]">
          {logo.name}
        </div>
        <div className="truncate text-[11px] text-black/40">
          {logo.imageUrl || "Henüz logo görseli yok — kartta baş harfler gözükür."}
        </div>
      </div>
    </div>
  )
}

function DateModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-[#3c639f] px-3 py-1.5 text-[12px] font-medium text-white"
          : "rounded-lg border border-black/[0.1] bg-white px-3 py-1.5 text-[12px] font-medium text-black/60 transition-colors hover:bg-black/[0.03]"
      }
    >
      {children}
    </button>
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

export type { ProjectCategory }

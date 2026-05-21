"use client"

// Form sonu yasal-onay kutusu. Admin /admin/smtp'den her form için
// 0+ yasal sayfa seçer; bu component o listeyi tek birleşik checkbox
// olarak render eder. Hiç sayfa seçili değilse hiçbir şey render etmez.
//
// Stil iki varyant: "card" (form içinde kart kenarlı), "inline" (sade).
// Çağıran sayfa onay state'ini kendi tutar; bu component sadece UI.

import { Check } from "lucide-react"
import { legalPageHref } from "@/lib/legal-types"
import type { ResolvedLegalPage } from "@/lib/form-legal-types"

export type FormConsentProps = {
  pages: ResolvedLegalPage[]
  checked: boolean
  onChange: (checked: boolean) => void
  // Erişilebilir hata mesajı için (opsiyonel)
  errorId?: string
  variant?: "default" | "compact"
}

export function FormConsent({
  pages,
  checked,
  onChange,
  errorId,
  variant = "default",
}: FormConsentProps) {
  if (pages.length === 0) return null

  const isCompact = variant === "compact"

  return (
    <label
      className={
        isCompact
          ? "flex cursor-pointer items-start gap-3"
          : "flex cursor-pointer items-start gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3.5"
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={errorId}
        className="peer sr-only"
      />
      <span
        className={`mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all ${
          checked
            ? "border-[#3c639f] bg-[#3c639f]"
            : "border-black/[0.2] bg-white"
        }`}
      >
        {checked && (
          <Check size={12} strokeWidth={3} className="text-white" />
        )}
      </span>

      <span
        className={
          isCompact
            ? "text-[12.5px] leading-relaxed text-black/70"
            : "text-[13px] leading-relaxed text-black/70"
        }
      >
        <span>Okudum ve kabul ediyorum:</span>{" "}
        {pages.map((p, i) => (
          <span key={p.id}>
            {i > 0 && <span className="text-black/35"> · </span>}
            <a
              href={legalPageHref(p.slug)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-[#3c639f] underline-offset-2 hover:underline"
            >
              {p.title}
            </a>
          </span>
        ))}
        <span className="text-[#3c639f]"> *</span>
      </span>
    </label>
  )
}

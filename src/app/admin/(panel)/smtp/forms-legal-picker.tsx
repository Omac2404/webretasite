"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import {
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Scale,
} from "lucide-react"
import type { SiteForm } from "@/lib/site-forms"
import type { LegalPage } from "@/lib/legal-types"
import type {
  FormLegalKey,
  FormLegalRequirements,
} from "@/lib/form-legal-types"
import { saveFormLegalAction, type FormLegalFormState } from "./actions"

// SITE_FORMS id'leri ↔ form-legal key'leri eşlemesi. İki taraf farklı
// adlandırma kullanıyor (Türkçe slug vs İngilizce form-legal key).
const SITE_FORM_TO_LEGAL_KEY: Record<string, FormLegalKey> = {
  iletisim: "inquiry",
  "teklif-sihirbazi": "quote",
  "randevu-formu": "appointment",
}

const INITIAL: FormLegalFormState = {}

export function FormsLegalPicker({
  siteForms,
  legalPages,
  initial,
}: {
  siteForms: SiteForm[]
  legalPages: LegalPage[]
  initial: FormLegalRequirements
}) {
  const [state, formAction, pending] = useActionState(
    saveFormLegalAction,
    INITIAL,
  )
  const [showSaved, setShowSaved] = useState(false)
  useEffect(() => {
    if (!state.ok) return
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 2400)
    return () => clearTimeout(t)
  }, [state.ok])

  // Her form için tutulan local seçim. Submit'te bu state'ten hidden
  // checkbox'lar oluşturup formAction'a postluyoruz.
  const [selections, setSelections] = useState<FormLegalRequirements>(initial)

  const toggle = (formKey: FormLegalKey, pageId: string) => {
    setSelections((prev) => {
      const current = prev[formKey] ?? []
      const next = current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId]
      return { ...prev, [formKey]: next }
    })
  }

  return (
    <form action={formAction}>
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div>
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Sitedeki formlar
          </div>
          <p className="mt-1 text-[12px] text-black/50">
            Toplam {siteForms.length} form. SMTP gönderim aktifken aşağıdaki
            formlar mail tetikleyebilir. Her formun altından kullanıcının
            onaylaması gereken yasal sayfaları seçebilirsin.
          </p>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {siteForms.map((f) => {
            const legalKey = SITE_FORM_TO_LEGAL_KEY[f.id]
            const selected = legalKey ? selections[legalKey] ?? [] : []
            return (
              <li
                key={f.id}
                className="rounded-xl border border-black/[0.06] bg-[#fafbfd] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {f.emailWired ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
                    ) : (
                      <Circle size={16} className="text-black/25" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-[#0a0a0a]">
                        {f.label}
                      </span>
                      <span
                        className={
                          f.emailWired
                            ? "rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                            : "rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                        }
                      >
                        {f.emailWired ? "Mail bağlı" : "Mail bağlanmadı"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-snug text-black/55">
                      {f.location}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-black/45">
                      <span className="rounded bg-black/[0.04] px-1.5 py-0.5 font-mono">
                        {f.handler}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={f.href}
                    target="_blank"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#3c639f] transition-colors hover:border-[#3c639f]/30 hover:bg-[#3c639f]/[0.04]"
                  >
                    Görüntüle
                    <ExternalLink size={11} />
                  </Link>
                </div>

                {/* Yasal onay seçici */}
                {legalKey && (
                  <div className="mt-4 border-t border-black/[0.06] pt-3">
                    <div className="flex items-center gap-2">
                      <Scale size={12} className="text-[#3c639f]" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/55">
                        Yasal onaylar
                      </span>
                      {selected.length > 0 && (
                        <span className="rounded bg-[#3c639f]/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#3c639f]">
                          {selected.length} seçili
                        </span>
                      )}
                    </div>

                    {legalPages.length === 0 ? (
                      <p className="mt-2 text-[12px] text-black/50">
                        Henüz yasal sayfa eklemedin.{" "}
                        <Link
                          href="/admin/yasal-sayfalar"
                          className="text-[#3c639f] underline-offset-2 hover:underline"
                        >
                          Yasal sayfalar sekmesinden
                        </Link>{" "}
                        ekleyip buraya gel.
                      </p>
                    ) : (
                      <>
                        <p className="mt-1.5 text-[12px] leading-snug text-black/50">
                          Bu formu gönderen ziyaretçinin onaylaması gereken
                          metinleri seç. Hiçbiri seçili değilse onay kutusu
                          görünmez.
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {legalPages.map((page) => {
                            const isSel = selected.includes(page.id)
                            return (
                              <li key={page.id}>
                                <label
                                  className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
                                    isSel
                                      ? "border-[#3c639f]/30 bg-[#3c639f]/[0.06] text-[#0a0a0a]"
                                      : "border-black/[0.08] bg-white text-black/65 hover:border-black/[0.18]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name={`${legalKey}__pages`}
                                    value={page.id}
                                    checked={isSel}
                                    onChange={() =>
                                      toggle(legalKey, page.id)
                                    }
                                    className="sr-only"
                                  />
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                      isSel
                                        ? "border-[#3c639f] bg-[#3c639f] text-white"
                                        : "border-black/[0.20] bg-white"
                                    }`}
                                  >
                                    {isSel && (
                                      <Check
                                        size={11}
                                        strokeWidth={3}
                                      />
                                    )}
                                  </span>
                                  <span className="font-medium">
                                    {page.title}
                                  </span>
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {state.error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
            {state.error}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || legalPages.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? "Kaydediliyor..." : "Yasal seçimleri kaydet"}
          </button>
          {showSaved && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700">
              <Check size={14} />
              Kaydedildi
            </span>
          )}
        </div>
      </section>

    </form>
  )
}

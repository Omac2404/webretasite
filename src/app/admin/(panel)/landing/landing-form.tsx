"use client"

import { useActionState, useState } from "react"
import { Check, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react"
import {
  MAX_LANDING_FAQS,
  MAX_LANDING_SECTIONS,
  type LandingPageContent,
  type LandingPageKey,
} from "@/lib/landing-content-types"
import { saveLandingPageAction, type SaveState } from "./actions"

export function LandingForm({
  pageKey,
  initial,
}: {
  pageKey: LandingPageKey
  initial: LandingPageContent
}) {
  const [state, formAction, isPending] = useActionState<SaveState, FormData>(
    saveLandingPageAction,
    {},
  )
  const [enabled, setEnabled] = useState(initial.enabled)
  const [sections, setSections] = useState(initial.sections)
  const [faqTitle, setFaqTitle] = useState(initial.faqTitle)
  const [faqs, setFaqs] = useState(initial.faqs)

  const payload = JSON.stringify({ enabled, sections, faqTitle, faqs })

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="page" value={pageKey} />
      <input type="hidden" name="payload" value={payload} />

      <label className="flex items-center gap-2.5 text-[13px] text-black/75">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
        />
        <span>Bu bölüm sitede görünsün</span>
      </label>

      {/* ── Serbest metin bölümleri ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#3c639f]">
            Metin bölümleri ({sections.length}/{MAX_LANDING_SECTIONS})
          </span>
          <button
            type="button"
            onClick={() =>
              setSections((p) =>
                p.length >= MAX_LANDING_SECTIONS
                  ? p
                  : [...p, { heading: "", body: "" }],
              )
            }
            disabled={sections.length >= MAX_LANDING_SECTIONS}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={12} /> Bölüm ekle
          </button>
        </div>
        {sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-black/[0.08] bg-black/[0.015] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-black/40">
                Bölüm {i + 1}
              </span>
              <button
                type="button"
                onClick={() => setSections((p) => p.filter((_, idx) => idx !== i))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Bölümü sil"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              type="text"
              value={s.heading}
              onChange={(e) =>
                setSections((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, heading: e.target.value } : x,
                  ),
                )
              }
              placeholder="Başlık"
              className={`${fieldInput} mt-2 font-medium`}
            />
            <textarea
              value={s.body}
              onChange={(e) =>
                setSections((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, body: e.target.value } : x,
                  ),
                )
              }
              rows={5}
              placeholder="Metin… (boş satır = yeni paragraf)"
              className={`${fieldInput} mt-2 resize-y leading-relaxed`}
            />
          </div>
        ))}
      </div>

      {/* ── SSS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            SSS başlığı
          </span>
          <input
            type="text"
            value={faqTitle}
            onChange={(e) => setFaqTitle(e.target.value)}
            className={fieldInput}
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#3c639f]">
            Sorular ({faqs.length}/{MAX_LANDING_FAQS})
          </span>
          <button
            type="button"
            onClick={() =>
              setFaqs((p) =>
                p.length >= MAX_LANDING_FAQS
                  ? p
                  : [...p, { question: "", answer: "" }],
              )
            }
            disabled={faqs.length >= MAX_LANDING_FAQS}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={12} /> Soru ekle
          </button>
        </div>
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-black/[0.08] bg-black/[0.015] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-black/40">
                Soru {i + 1}
              </span>
              <button
                type="button"
                onClick={() => setFaqs((p) => p.filter((_, idx) => idx !== i))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Soruyu sil"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              type="text"
              value={f.question}
              onChange={(e) =>
                setFaqs((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, question: e.target.value } : x,
                  ),
                )
              }
              placeholder="Soru"
              className={`${fieldInput} mt-2 font-medium`}
            />
            <textarea
              value={f.answer}
              onChange={(e) =>
                setFaqs((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, answer: e.target.value } : x,
                  ),
                )
              }
              rows={3}
              placeholder="Cevap"
              className={`${fieldInput} mt-2 resize-y leading-relaxed`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        {state.ok && !isPending && (
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
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Kaydet
        </button>
      </div>
    </form>
  )
}

const fieldInput =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

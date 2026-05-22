"use client"

import { useEffect, useState, useTransition } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { submitInquiry } from "@/app/iletisim/actions"
import {
  DEFAULT_FORM_SUCCESS,
  type FormSuccessScreen,
} from "@/lib/form-success-types"
import {
  fillPlaceholders,
  splitParagraphs,
} from "@/lib/form-success-render"
import type { ResolvedLegalPage } from "@/lib/form-legal-types"
import { FormConsent } from "@/components/FormConsent"
import { trackFormSubmit } from "@/lib/track-client"

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; name: string }

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [isPending, startTransition] = useTransition()
  const [consent, setConsent] = useState(false)
  const [successCopy, setSuccessCopy] = useState<FormSuccessScreen>(
    DEFAULT_FORM_SUCCESS.inquiry,
  )
  const [legalPages, setLegalPages] = useState<ResolvedLegalPage[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/form-success", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { inquiry?: FormSuccessScreen } | null) => {
        if (cancelled || !data?.inquiry) return
        setSuccessCopy(data.inquiry)
      })
      .catch(() => {})
    fetch("/api/form-legal", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { inquiry?: ResolvedLegalPage[] } | null) => {
        if (cancelled || !Array.isArray(data?.inquiry)) return
        setLegalPages(data.inquiry)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (legalPages.length > 0 && !consent) {
      setStatus({
        kind: "error",
        message: "Lütfen yasal metinleri onayladığınızı işaretleyin.",
      })
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "").trim()
    startTransition(async () => {
      const res = await submitInquiry(data)
      if (res.ok) {
        trackFormSubmit("contact", "İletişim formu")
        setStatus({ kind: "success", name })
        form.reset()
        setConsent(false)
      } else {
        setStatus({ kind: "error", message: res.error })
      }
    })
  }

  if (status.kind === "success") {
    const vars = { name: status.name }
    const title = fillPlaceholders(successCopy.title, vars)
    const bodyParagraphs = splitParagraphs(fillPlaceholders(successCopy.body, vars))
    return (
      <div className="rounded-2xl border border-[#3c639f]/15 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3c639f]/10">
          <Check size={26} className="text-[#3c639f]" strokeWidth={2.25} />
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          {title}
        </h3>
        {bodyParagraphs.map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "mt-2 whitespace-pre-line text-[14px] leading-relaxed text-black/55"
                : "mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-black/45"
            }
          >
            {p}
          </p>
        ))}
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
        >
          {successCopy.ctaLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="name" label="Ad Soyad" placeholder="Adınız" required autoComplete="name" />
        <Field name="email" type="email" label="E-posta" placeholder="ornek@firma.com" required autoComplete="email" />
        <Field name="phone" type="tel" label="Telefon" placeholder="+90" autoComplete="tel" />
        <Field name="subject" label="Konu" placeholder="Nasıl yardımcı olabiliriz?" />
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="block text-[12px] font-medium text-black/55">
          Mesajınız
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="iletinizi yazın"
          className="mt-1.5 w-full resize-y rounded-md border border-black/[0.08] bg-[#fafafa] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c639f]/15"
        />
      </div>

      {status.kind === "error" && (
        <p className="mt-4 text-[13px] text-red-600">{status.message}</p>
      )}

      {legalPages.length > 0 && (
        <div className="mt-6">
          <FormConsent
            pages={legalPages}
            checked={consent}
            onChange={setConsent}
            variant="compact"
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#3c639f] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Gönderiliyor
            </>
          ) : (
            <>
              Gönder
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={`contact-${name}`} className="block text-[12px] font-medium text-black/55">
        {label}
        {required && <span className="ml-0.5 text-[#3c639f]">*</span>}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-md border border-black/[0.08] bg-[#fafafa] px-3.5 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c639f]/15"
      />
    </div>
  )
}

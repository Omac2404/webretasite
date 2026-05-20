"use client"

import { useState, useTransition } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { submitInquiry } from "@/app/iletisim/actions"

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success" }

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [isPending, startTransition] = useTransition()
  const [consent, setConsent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!consent) {
      setStatus({
        kind: "error",
        message: "Lütfen K.V.K.K. ve çerez onayını işaretleyin.",
      })
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const res = await submitInquiry(data)
      if (res.ok) {
        setStatus({ kind: "success" })
        form.reset()
        setConsent(false)
      } else {
        setStatus({ kind: "error", message: res.error })
      }
    })
  }

  if (status.kind === "success") {
    return (
      <div className="rounded-2xl border border-[#3c639f]/15 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3c639f]/10">
          <Check size={26} className="text-[#3c639f]" strokeWidth={2.25} />
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Mesajınız bize ulaştı.
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-black/55">
          24 saat içinde döneceğiz. Acil bir durumda telefonla
          ulaşmaktan çekinmeyin.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
        >
          Yeni mesaj gönder
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-start gap-2 text-[12.5px] leading-relaxed text-black/65">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-[3px] h-4 w-4 shrink-0 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]"
          />
          <span>K.V.K.K. ve çerezleri onaylıyorum.</span>
        </label>
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

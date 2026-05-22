"use client"

// Single reset entrypoint for the analytics panel. Replaces every
// per-day / per-month reset button — admin clears EVERYTHING in one go,
// with the option to download a PDF backup first.
//
// The PDF generator here is intentionally a placeholder: it emits a tiny
// valid PDF with a "yakında dolacak" message. When the rest of the
// analytics work is done we'll wire in a proper multi-page report.

import { useEffect, useState, useTransition } from "react"
import { Download, Loader2, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearAnalyticsAction } from "./actions"

export function ResetDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Lock body scroll while the dialog is open so the backdrop reads as
  // a proper modal instead of a floating overlay over a scrolling page.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, pending])

  function downloadPlaceholderPdf() {
    const body = buildPlaceholderPdf()
    const blob = new Blob([body], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `webreta-analitik-rapor-${stamp}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Revoke after the click has had a chance to dispatch the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function reset(withDownload: boolean) {
    if (withDownload) downloadPlaceholderPdf()
    startTransition(async () => {
      // Small head-start so the browser actually starts the download
      // before the page reloads on revalidation.
      if (withDownload) {
        await new Promise((r) => setTimeout(r, 400))
      }
      await clearAnalyticsAction()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium text-black/60 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 size={12} />
        Tümünü sıfırla
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <button
            type="button"
            aria-label="Modalı kapat"
            onClick={() => {
              if (!pending) setOpen(false)
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]"
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.30)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={18} />
              </div>
              <div className="flex-1">
                <h2
                  id="reset-dialog-title"
                  className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
                >
                  Tüm analitik verileri sıfırla
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-black/60">
                  Bu zamana kadar olan tüm verileri (sayfa görüntüleme,
                  bölüm durmaları, tıklamalar, ziyaretçi listesi) silmek
                  üzeresin. Sıfırlamadan önce yedek olarak rapor indirmek
                  ister misin?
                </p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-black/40">
                  Not: PDF raporu şu an placeholder — gerçek rapor sonra
                  hazırlanacak.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!pending) setOpen(false)
                }}
                disabled={pending}
                aria-label="Kapat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black/80 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => reset(true)}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3c639f] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Evet, indir ve sıfırla
              </button>
              <button
                type="button"
                onClick={() => reset(false)}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Hayır, doğrudan sıfırla
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-[13px] font-medium text-black/55 transition-colors hover:bg-black/[0.04] hover:text-[#0a0a0a] disabled:opacity-60"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Placeholder PDF ──────────────────────────────────────────────────
// Minimal valid PDF (PDF 1.4). One A4 page, Helvetica text. Built with
// dynamic byte-offset tracking so the xref table stays correct no
// matter how the content grows. Replace with a real report when we
// hook up the data export.

function buildPlaceholderPdf(): string {
  const reportedAt = new Date().toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
  })
  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    "(Webreta Analitik Raporu) Tj",
    "0 -28 Td",
    "/F1 12 Tf",
    "(Bu dosya bir placeholder.) Tj",
    "0 -18 Td",
    "(Detayli rapor yakinda eklenecek.) Tj",
    "0 -28 Td",
    "/F1 10 Tf",
    `(Olusturma: ${reportedAt.replace(/[()\\]/g, "")}) Tj`,
    "ET",
  ].join("\n")

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  let body = "%PDF-1.4\n"
  const offsets: number[] = [0]
  for (let i = 0; i < objects.length; i++) {
    offsets.push(body.length)
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefStart = body.length
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  body += xref
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return body
}

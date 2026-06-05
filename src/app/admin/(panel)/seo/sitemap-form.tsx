"use client"

import { useActionState, useState } from "react"
import { Check, AlertCircle, Loader2, Copy, ExternalLink } from "lucide-react"
import type { SeoData } from "@/lib/seo-types"
import { saveSitemapSettingsAction, type SaveState } from "./actions"

export function SitemapForm({
  initial,
  siteUrl,
}: {
  initial: SeoData["sitemap"]
  siteUrl: string
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveSitemapSettingsAction,
    {},
  )
  const base = (siteUrl || "https://webreta.com.tr").replace(/\/+$/, "")
  const sitemapUrl = `${base}/sitemap.xml`
  const robotsUrl = `${base}/robots.txt`
  const [copied, setCopied] = useState<"sitemap" | "robots" | null>(null)

  async function copy(url: string, which: "sitemap" | "robots") {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <UrlCard
          label="Sitemap"
          url={sitemapUrl}
          copied={copied === "sitemap"}
          onCopy={() => copy(sitemapUrl, "sitemap")}
        />
        <UrlCard
          label="robots.txt"
          url={robotsUrl}
          copied={copied === "robots"}
          onCopy={() => copy(robotsUrl, "robots")}
        />
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-[12px] leading-relaxed text-black/65">
        <strong className="font-medium text-[#0a0a0a]">
          Google Search Console
        </strong>{" "}
        kaydı için: search.google.com/search-console &rarr; mülk seç &rarr;
        Site haritaları &rarr; yukarıdaki sitemap URL'ini ekle. Yayında olan
        her blog yazısı otomatik dahil edilir.
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex items-start gap-2.5 rounded-lg border border-black/[0.08] p-3 text-[13px] text-black/75">
          <input
            type="checkbox"
            name="includeLegalPages"
            defaultChecked={initial.includeLegalPages}
            className="mt-0.5 h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
          />
          <div>
            <div className="font-medium text-[#0a0a0a]">
              Yasal sayfaları sitemap'e dahil et
            </div>
            <div className="text-[11.5px] text-black/50">
              Varsayılan: kapalı. Kapalıyken /yasal/* hem sitemap'ten
              çıkarılır hem de robots.txt'te Disallow olarak işaretlenir.
            </div>
          </div>
        </label>

        <Field
          label="Manuel ekstra URL'ler"
          hint="Her satıra bir URL — site içi yol (/ornek) veya tam URL."
        >
          <textarea
            name="extraUrls"
            rows={4}
            placeholder={"/ozel-sayfa\nhttps://baska-alan.webreta.com.tr/icerik"}
            defaultValue={initial.extraUrls.join("\n")}
            className={`${inputCls} resize-none font-mono text-[12.5px]`}
          />
        </Field>

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
            className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}

function UrlCard({
  label,
  url,
  copied,
  onCopy,
}: {
  label: string
  url: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-2.5">
      <div className="flex min-w-0 flex-col">
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-black/45">
          {label}
        </span>
        <code className="truncate text-[12px] text-[#0a0a0a]">{url}</code>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md border border-black/[0.10] bg-white px-2 py-1.5 text-[11.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.04]"
          title="Kopyala"
        >
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-black/[0.10] bg-white px-2 py-1.5 text-[11.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.04]"
          title="Aç"
        >
          <ExternalLink size={12} />
          Aç
        </a>
      </div>
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

const inputCls =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

"use client"

import { useMemo, useState } from "react"
import {
  ChevronDown,
  Check,
  AlertTriangle,
  XCircle,
  Search,
} from "lucide-react"
import { runChecks, summarize, type SeoCheckSeverity } from "@/lib/seo-checklist"
import { slugify as slugifyTitle, type BlogPostSeo } from "@/lib/blog-types"
import { GooglePreview } from "@/components/admin/GooglePreview"

export type SeoPanelProps = {
  initial?: BlogPostSeo
  // Live signals from the parent form so the checklist updates on edit
  liveTitle: string
  liveExcerpt: string
  liveContent: string
  liveCoverImage: string
  existingSlug?: string
  // Site-level SEO defaults so the preview can mirror what Google sees.
  siteUrl?: string
  siteName?: string
  titleTemplate?: string
}

export function BlogSeoPanel({
  initial,
  liveTitle,
  liveExcerpt,
  liveContent,
  liveCoverImage,
  existingSlug,
  siteUrl,
  siteName,
  titleTemplate,
}: SeoPanelProps) {
  const [open, setOpen] = useState(false)
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "")
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? "",
  )
  const [keywords, setKeywords] = useState(
    initial?.keywords?.join(", ") ?? "",
  )
  const [focusKeyword, setFocusKeyword] = useState(
    initial?.focusKeyword ?? "",
  )
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "")
  const [noindex, setNoindex] = useState(initial?.noindex ?? false)
  const [includeInSitemap, setIncludeInSitemap] = useState(
    initial?.includeInSitemap !== false,
  )

  const slug = existingSlug || slugifyTitle(liveTitle || "")

  const checks = useMemo(
    () =>
      runChecks({
        title: liveTitle,
        metaTitle,
        excerpt: liveExcerpt,
        metaDescription,
        content: liveContent,
        slug,
        coverImage: liveCoverImage,
        focusKeyword,
      }),
    [
      liveTitle,
      metaTitle,
      liveExcerpt,
      metaDescription,
      liveContent,
      slug,
      liveCoverImage,
      focusKeyword,
    ],
  )

  const summary = summarize(checks)
  const scoreColor =
    summary.score >= 80
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : summary.score >= 50
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200"

  return (
    <div className="rounded-xl border border-black/[0.08] bg-[#f9fbff]">
      {/* Hidden inputs so the form picks up SEO fields on submit */}
      <input type="hidden" name="seo_metaTitle" value={metaTitle} />
      <input type="hidden" name="seo_metaDescription" value={metaDescription} />
      <input type="hidden" name="seo_keywords" value={keywords} />
      <input type="hidden" name="seo_focusKeyword" value={focusKeyword} />
      <input type="hidden" name="seo_ogImage" value={ogImage} />
      {noindex && <input type="hidden" name="seo_noindex" value="on" />}
      {includeInSitemap && (
        <input type="hidden" name="seo_includeInSitemap" value="on" />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <Search size={15} className="text-[#3c639f]" />
          <span className="text-[13px] font-semibold text-[#0a0a0a]">
            SEO ayarları
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${scoreColor}`}
          >
            Skor {summary.score}
          </span>
          <span className="text-[11px] text-black/45">
            {summary.ok}/{summary.total} ok · {summary.warn} uyarı
            {summary.bad > 0 ? ` · ${summary.bad} hata` : ""}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-black/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-black/[0.06] p-4">
          <GooglePreview
            title={
              titleTemplate
                ? titleTemplate.replace(
                    "%s",
                    (metaTitle.trim() || liveTitle).trim() || "Yazı başlığı",
                  )
                : (metaTitle.trim() || liveTitle).trim() || "Yazı başlığı"
            }
            description={metaDescription.trim() || liveExcerpt}
            url={buildBlogUrl(siteUrl, slug)}
            siteName={siteName}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_1fr]">
          {/* Form fields */}
          <div className="flex flex-col gap-3">
            <Field
              label="Odak kelime"
              hint="Bu yazının ana arama kelimesi. Checklist bunu kullanır."
            >
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="örn. web tasarım izmir"
                className={inputCls}
              />
            </Field>
            <Field
              label={`Meta başlık (${metaTitle.length}/60)`}
              hint="Boş bırakırsan yazı başlığı kullanılır."
            >
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={120}
                placeholder={liveTitle || "Yazı başlığı kullanılacak"}
                className={inputCls}
              />
            </Field>
            <Field
              label={`Meta açıklama (${metaDescription.length}/160)`}
              hint="Boş bırakırsan özet kullanılır."
            >
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={liveExcerpt || "Özet kullanılacak"}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field
              label="Anahtar kelimeler"
              hint="Virgül veya satır ile ayır."
            >
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="izmir, web tasarım, ajans"
                className={inputCls}
              />
            </Field>
            <Field
              label="OG / paylaşım görseli"
              hint="Boş bırakırsan kapak görseli kullanılır."
            >
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="/blog/og.png"
                className={inputCls}
              />
            </Field>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-[12.5px] text-black/70">
                <input
                  type="checkbox"
                  checked={includeInSitemap}
                  onChange={(e) => setIncludeInSitemap(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
                />
                Sitemap&apos;e dahil et
              </label>
              <label className="flex items-center gap-2 text-[12.5px] text-black/70">
                <input
                  type="checkbox"
                  checked={noindex}
                  onChange={(e) => setNoindex(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]/30"
                />
                noindex
              </label>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[11.5px] font-medium uppercase tracking-wider text-black/45">
              SEO Kontrolleri
            </div>
            <ul className="flex flex-col gap-1">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-2 rounded-md bg-white px-2.5 py-1.5 text-[12px]"
                >
                  <StatusIcon status={c.status} />
                  <div className="flex flex-col">
                    <span className="text-black/80">{c.label}</span>
                    {c.hint && (
                      <span className="text-[11px] text-black/45">{c.hint}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

function buildBlogUrl(siteUrl: string | undefined, slug: string): string {
  const base = (siteUrl || "https://webreta.com").replace(/\/+$/, "")
  return `${base}/blog/${slug || "yazi-slugi"}`
}

function StatusIcon({ status }: { status: SeoCheckSeverity }) {
  if (status === "ok")
    return <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
  if (status === "warn")
    return (
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
    )
  return <XCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
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
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-black/55">{label}</span>
      {hint && <span className="text-[11px] text-black/40">{hint}</span>}
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"

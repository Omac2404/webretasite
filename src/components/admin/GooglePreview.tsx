"use client"

import { useState } from "react"
import { Globe, Smartphone, Monitor } from "lucide-react"

// RankMath-style Google SERP preview. Renders what the page would look
// like in Google search results — title in blue, URL breadcrumb, snippet.
// Used inside SEO admin (per-page, blog editor, global defaults).

type Mode = "desktop" | "mobile"

export type GooglePreviewProps = {
  // Already-resolved values (caller applies fallbacks + titleTemplate).
  title: string
  description: string
  url: string
  siteName?: string
  // Optional warnings: width recommendations for title (~60 chars) and
  // description (~160 chars). Pass undefined to hide the bar.
  titleLimit?: number
  descriptionLimit?: number
}

export function GooglePreview({
  title,
  description,
  url,
  siteName,
  titleLimit = 60,
  descriptionLimit = 160,
}: GooglePreviewProps) {
  const [mode, setMode] = useState<Mode>("desktop")

  const safeTitle = title.trim() || "(başlık yok)"
  const safeDesc =
    description.trim() ||
    "Açıklama girilmediği için Google rastgele bir parça gösterebilir."
  const { host, path } = parseUrl(url)
  const breadcrumb = buildBreadcrumb(path)

  return (
    <div className="rounded-xl border border-black/[0.08] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-black/55">
          <Globe size={12} className="text-[#3c639f]" />
          Google önizleme
        </div>
        <div className="flex items-center gap-1 rounded-full border border-black/[0.08] bg-white p-0.5">
          <ModeBtn
            active={mode === "desktop"}
            onClick={() => setMode("desktop")}
            icon={<Monitor size={11} />}
            label="Masaüstü"
          />
          <ModeBtn
            active={mode === "mobile"}
            onClick={() => setMode("mobile")}
            icon={<Smartphone size={11} />}
            label="Mobil"
          />
        </div>
      </div>

      <div
        className={`px-4 py-4 ${mode === "mobile" ? "mx-auto max-w-[360px]" : ""}`}
      >
        <div className="flex items-center gap-2">
          <FaviconCircle host={host} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[14px] text-[#202124]">
              {siteName || host || "siteadi.com"}
            </span>
            <span className="truncate text-[12px] text-[#4d5156]">
              {host}
              {breadcrumb}
            </span>
          </div>
        </div>
        <h3
          className={`mt-2 cursor-pointer font-normal text-[#1a0dab] hover:underline ${
            mode === "mobile"
              ? "text-[16px] leading-[22px]"
              : "text-[20px] leading-[26px]"
          }`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {safeTitle}
        </h3>
        <p
          className={`mt-1 text-[#4d5156] ${
            mode === "mobile"
              ? "text-[13px] leading-[18px]"
              : "text-[14px] leading-[20px]"
          }`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {safeDesc}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/[0.04] bg-[#fbfbfc] px-3 py-2 text-[11px] text-black/55">
        <CharCounter
          label="Başlık"
          length={title.length}
          limit={titleLimit}
        />
        <CharCounter
          label="Açıklama"
          length={description.length}
          limit={descriptionLimit}
        />
        <span className="ml-auto truncate text-black/40" title={url}>
          {url || "URL boş"}
        </span>
      </div>
    </div>
  )
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? "bg-[#3c639f] text-white"
          : "text-black/55 hover:text-[#0a0a0a]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function CharCounter({
  label,
  length,
  limit,
}: {
  label: string
  length: number
  limit: number
}) {
  const tone =
    length === 0
      ? "text-black/35"
      : length > limit
        ? "text-red-600"
        : length > Math.round(limit * 0.85)
          ? "text-amber-600"
          : "text-emerald-700"
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-black/45">{label}:</span>
      <span className={`tabular-nums font-medium ${tone}`}>
        {length}/{limit}
      </span>
    </span>
  )
}

function FaviconCircle({ host }: { host: string }) {
  const letter = (host || "?").replace(/^www\./, "").charAt(0).toUpperCase()
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] text-[12px] font-semibold text-[#3c4043]"
      aria-hidden
    >
      {letter}
    </div>
  )
}

function parseUrl(raw: string): { host: string; path: string } {
  if (!raw) return { host: "", path: "" }
  try {
    const u = new URL(raw)
    return { host: u.host, path: u.pathname }
  } catch {
    // Allow "/iletisim" without a host — treat it as path-only.
    if (raw.startsWith("/")) return { host: "", path: raw }
    return { host: raw, path: "" }
  }
}

// Convert "/blog/foo-bar" → " › blog › foo bar" (Google-style breadcrumbs)
function buildBreadcrumb(path: string): string {
  if (!path || path === "/") return ""
  const parts = path.split("/").filter(Boolean)
  if (parts.length === 0) return ""
  return parts.map((p) => ` › ${decodeURIComponent(p).replace(/-/g, " ")}`).join("")
}

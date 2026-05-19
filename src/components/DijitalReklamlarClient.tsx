"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  Check,
  ChevronDown,
  X,
  ArrowRight,
  ArrowLeft,
  Phone,
  CalendarClock,
} from "lucide-react"
import type {
  Channel,
  ChannelKey,
  Pkg,
} from "@/lib/packages-types"
import { bookAppointmentAction } from "@/app/dijital-reklamlar/actions"

// Replace with the real Webreta WhatsApp number when ready. The wa.me
// link is built from E.164 without the leading "+".
const WHATSAPP_NUMBER = "905321234567"
const WHATSAPP_DISPLAY = "+90 532 123 45 67"

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

// ── Scheduling helpers ──────────────────────────────────────────────────
// Work hours: 10:00–18:00. We treat 18:00 as the end-of-day boundary, so
// hourly slots run 10, 11, …, 17. Earliest bookable slot is the next
// :00 hour that's at least 3h away from `now`. If that lands past 17:00,
// roll forward to 10:00 the next day.

const SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17]
const DATE_LIST_COUNT = 10
const TR_DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]
const TR_MONTHS_SHORT = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
]

function getEarliestSlot(now: Date): Date {
  const candidate = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  if (
    candidate.getMinutes() > 0 ||
    candidate.getSeconds() > 0 ||
    candidate.getMilliseconds() > 0
  ) {
    candidate.setHours(candidate.getHours() + 1, 0, 0, 0)
  }
  // Walk forward until we land inside [10, 17].
  for (let i = 0; i < 48; i++) {
    const h = candidate.getHours()
    if (h < 10) {
      candidate.setHours(10, 0, 0, 0)
    } else if (h > 17) {
      candidate.setDate(candidate.getDate() + 1)
      candidate.setHours(10, 0, 0, 0)
    } else {
      return candidate
    }
  }
  return candidate
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function getValidHoursForDate(date: Date, earliest: Date): number[] {
  const dayStart = startOfDay(date).getTime()
  const earliestDayStart = startOfDay(earliest).getTime()
  if (dayStart < earliestDayStart) return []
  if (dayStart > earliestDayStart) return SLOT_HOURS
  return SLOT_HOURS.filter((h) => h >= earliest.getHours())
}

function getDateList(start: Date, count: number): Date[] {
  const base = startOfDay(start)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDateChip(date: Date, today: Date): { label: string; sub: string } {
  const d = startOfDay(date).getTime()
  const t = startOfDay(today).getTime()
  const diff = Math.round((d - t) / 86400000)
  let label = ""
  if (diff === 0) label = "Bugün"
  else if (diff === 1) label = "Yarın"
  else label = TR_DAYS_SHORT[new Date(date).getDay()]
  const sub = `${new Date(date).getDate()} ${TR_MONTHS_SHORT[new Date(date).getMonth()]}`
  return { label, sub }
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Channel visual tokens. Used sparingly: small mark icon, "En Popüler"
// badge, animated ring on the featured card, and a soft hover glow.
// Everything else stays on the brand navy (#3c639f) so the page reads
// as Webreta first, channel second.
type ChannelTheme = {
  primary: string
  ringGradient: string
  badgeGradient: string
  glow: string
  softTint: string
}

const THEMES: Record<ChannelKey, ChannelTheme> = {
  google: {
    primary: "#4285F4",
    // Conic over the 4 Google brand stops, looped so animation has no seam
    ringGradient:
      "conic-gradient(from 0deg, #4285F4 0%, #EA4335 25%, #FBBC04 50%, #34A853 75%, #4285F4 100%)",
    badgeGradient: "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
    glow: "rgba(66, 133, 244, 0.22)",
    softTint: "rgba(66, 133, 244, 0.08)",
  },
  meta: {
    primary: "#0866FF",
    // Meta blue → Instagram purple/red/orange → Meta blue
    ringGradient:
      "conic-gradient(from 0deg, #0866FF 0%, #833AB4 30%, #FD1D1D 55%, #FCAF45 75%, #0866FF 100%)",
    badgeGradient: "linear-gradient(135deg, #0866FF 0%, #833AB4 100%)",
    glow: "rgba(8, 102, 255, 0.22)",
    softTint: "rgba(8, 102, 255, 0.08)",
  },
  "360": {
    primary: "#3c639f",
    // Blend: Google blue → Meta blue → Instagram purple → Google green
    ringGradient:
      "conic-gradient(from 0deg, #4285F4 0%, #0866FF 25%, #833AB4 55%, #34A853 80%, #4285F4 100%)",
    badgeGradient:
      "linear-gradient(135deg, #4285F4 0%, #833AB4 60%, #0866FF 100%)",
    glow: "rgba(60, 99, 159, 0.22)",
    softTint: "rgba(60, 99, 159, 0.08)",
  },
}

// Tiny channel marks. Sit in a soft tinted square at the top of each
// card so the channel is identifiable at a glance.

function GoogleMark({ size = 22 }: { size?: number }) {
  // Approximation of the modern Google Ads logo — two stacked triangles
  // (blue + yellow) with a small green dot at the base, matching the
  // recognizable mark in Google's product family.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        d="M9.6 3.2 2.7 15.5a3 3 0 0 0 1.1 4.1l.06.03a3 3 0 0 0 4.1-1.1L14.9 6.2a3 3 0 0 0-1.1-4.1l-.06-.03a3 3 0 0 0-4.13 1.13z"
        fill="#FBBC04"
      />
      <path
        d="M14.4 3.2 21.3 15.5a3 3 0 0 1-1.1 4.1l-.06.03a3 3 0 0 1-4.1-1.1L9.1 6.2a3 3 0 0 1 1.1-4.1l.06-.03a3 3 0 0 1 4.13 1.13z"
        fill="#4285F4"
      />
      <circle cx="6.4" cy="18.05" r="3" fill="#34A853" />
    </svg>
  )
}

function MetaMark({ size = 22 }: { size?: number }) {
  // Stylized Meta infinity-loop, single stroke that crosses over itself.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none">
      <defs>
        <linearGradient id="meta-mark-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#0866FF" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <path
        d="M3 12c0-3 1.7-5.5 4.3-5.5 2 0 3.4 1.4 4.7 3.6l1 1.8c1.3 2.3 2.7 3.6 4.7 3.6 1.8 0 3.3-1.4 3.3-3.5S19.5 8.5 17.7 8.5c-1.8 0-3.2 1.3-4.5 3.6L12 14c-1.3 2.2-2.7 3.5-4.7 3.5C4.7 17.5 3 15 3 12z"
        stroke="url(#meta-mark-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ThreeSixtyMark({ size = 22 }: { size?: number }) {
  // Globe-ish loop hinting at "all channels". Gradient blends G+Meta.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none">
      <defs>
        <linearGradient id="threesixty-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="55%" stopColor="#833AB4" />
          <stop offset="100%" stopColor="#0866FF" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="url(#threesixty-grad)"
        strokeWidth="1.8"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="3.5"
        ry="8.5"
        stroke="url(#threesixty-grad)"
        strokeWidth="1.8"
      />
      <circle cx="20" cy="12" r="1.6" fill="url(#threesixty-grad)" />
    </svg>
  )
}

function ChannelMark({ channel, size }: { channel: ChannelKey; size?: number }) {
  if (channel === "google") return <GoogleMark size={size} />
  if (channel === "meta") return <MetaMark size={size} />
  return <ThreeSixtyMark size={size} />
}

// Small brand-mark for popup footers. Sits at the bottom-left so the
// popup feels owned by Webreta even when its content is channel-themed.
function PopupBrand() {
  return (
    <a
      href="/"
      aria-label="Webreta"
      className="inline-flex items-center opacity-55 transition-opacity hover:opacity-90"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/webreta-logo.webp"
        alt="Webreta"
        className="h-5 w-auto"
      />
    </a>
  )
}

// ── Detail modal (desktop) ──────────────────────────────────────────────

function DetailModal({
  pkg,
  channel,
  onClose,
}: {
  pkg: Pkg
  channel: Channel
  onClose: () => void
}) {
  const theme = THEMES[channel.key]
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    // Lock body scroll while modal is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!mounted) return null

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />

      <div
        className="relative w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.30)] transition-all duration-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
        }}
      >
        {/* Thin channel-colored accent strip at the very top of the modal */}
        <div className="h-[3px] w-full" style={{ background: theme.badgeGradient }} />

        {/* Header — channel mark, package name, price, close */}
        <div className="flex items-start justify-between gap-6 px-7 pt-6 md:px-9 md:pt-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: theme.softTint }}
            >
              <ChannelMark channel={channel.key} size={26} />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.10em] text-black/40">
                {channel.label}
              </span>
              <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[28px]">
                {pkg.name}
              </h3>
              <p className="mt-1 max-w-[480px] text-[14px] leading-relaxed text-black/55">
                {pkg.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/45 transition-colors hover:bg-black/[0.05] hover:text-black/80"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Price row */}
        <div className="mt-5 flex items-baseline gap-2 px-7 md:px-9">
          <span className="text-[44px] font-bold tracking-[-0.03em] text-[#0a0a0a] md:text-[52px]">
            {pkg.price}
          </span>
          <span className="text-[15px] text-black/45">/ay</span>
        </div>

        {/* Body — package contents split into two balanced columns. Capped
            at 12 items total (6 per column) so the modal never overflows. */}
        {(() => {
          const allItems = pkg.items.slice(0, 12)
          const half = Math.ceil(allItems.length / 2)
          const left = allItems.slice(0, half)
          const right = allItems.slice(half)
          const renderCol = (items: string[]) => (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-black/75"
                >
                  <Check
                    size={16}
                    className="mt-[3px] shrink-0 text-[#3c639f]"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
          return (
            <div className="grid grid-cols-1 gap-6 px-7 py-7 md:grid-cols-2 md:gap-10 md:px-9 md:py-8">
              {renderCol(left)}
              {right.length > 0 && renderCol(right)}
            </div>
          )
        })()}

        {/* Footer — close action with brand mark on the left */}
        <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#fafafa] px-7 py-5 md:px-9">
          <PopupBrand />
          <button
            onClick={onClose}
            className="rounded-md border border-black/10 bg-white px-5 py-2.5 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.04]"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

// ── Request modal ───────────────────────────────────────────────────────
// Three views in a single modal:
//   choice    → pick "Biz size ulaşalım" or "WhatsApp'tan yazın"
//   schedule  → date chips + hour slots + phone field
//   success   → confirmation
// WhatsApp path opens a wa.me link in a new tab with a prefilled message.

type RequestView = "choice" | "schedule" | "success"

function RequestModal({
  pkg,
  channel,
  onClose,
}: {
  pkg: Pkg
  channel: Channel
  onClose: () => void
}) {
  const theme = THEMES[channel.key]
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState<RequestView>("choice")

  const [now, setNow] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // `now` is captured on mount so the slot math stays stable while the
    // user is filling the form. (Re-deriving on every render would let
    // available slots shift mid-interaction.)
    setNow(new Date())
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const earliest = useMemo(() => (now ? getEarliestSlot(now) : null), [now])
  const dateList = useMemo(
    () => (earliest ? getDateList(earliest, DATE_LIST_COUNT) : []),
    [earliest]
  )

  // When entering schedule view, seed selection with the earliest valid slot.
  useEffect(() => {
    if (view === "schedule" && earliest && !selectedDate) {
      setSelectedDate(startOfDay(earliest))
      setSelectedHour(earliest.getHours())
    }
  }, [view, earliest, selectedDate])

  const validHours = useMemo(() => {
    if (!selectedDate || !earliest) return []
    return getValidHoursForDate(selectedDate, earliest)
  }, [selectedDate, earliest])

  // If user picks a date whose valid hours don't include the current
  // selectedHour (e.g. switched from today→tomorrow then back), realign.
  useEffect(() => {
    if (
      selectedDate &&
      selectedHour !== null &&
      validHours.length > 0 &&
      !validHours.includes(selectedHour)
    ) {
      setSelectedHour(validHours[0])
    }
  }, [validHours, selectedDate, selectedHour])

  const phoneDigits = phone.replace(/\D/g, "")
  const canSubmit =
    selectedDate !== null && selectedHour !== null && phoneDigits.length >= 10

  const waMessage = encodeURIComponent(
    `Merhaba, ${channel.label} - ${pkg.name} (${pkg.price}/ay) hakkında bilgi almak istiyorum.`
  )
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  async function handleSubmit() {
    if (!canSubmit || !selectedDate || selectedHour === null) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await bookAppointmentAction({
        channelKey: channel.key,
        channelLabel: channel.label,
        pkgKey: pkg.key,
        pkgName: pkg.name,
        pkgPrice: pkg.price,
        name: name.trim(),
        phone: phoneDigits,
        email: email.trim(),
        dateIso: selectedDate.toISOString(),
        hour: selectedHour,
      })
      if (res.ok) {
        setView("success")
      } else {
        setSubmitError(res.error)
      }
    } catch {
      setSubmitError("Bir şeyler ters gitti. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  const headerLabel = channel.label
  const headerName = pkg.name

  const choiceView = (
    <div className="px-7 py-7 md:px-9 md:py-8">
      <p className="text-[15px] leading-relaxed text-black/65">
        Bu paket için bizimle nasıl iletişim kurmak istersiniz?
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Biz size ulaşalım — internal callback flow */}
        <button
          type="button"
          onClick={() => setView("schedule")}
          className="group relative flex flex-col items-start gap-3 rounded-xl border border-black/[0.08] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3c639f]/30 hover:shadow-[0_12px_28px_-12px_rgba(60,99,159,0.30)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#3c639f]/[0.10] text-[#3c639f] transition-colors group-hover:bg-[#3c639f] group-hover:text-white">
            <CalendarClock size={22} strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[#0a0a0a]">
              Biz size ulaşalım
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-black/55">
              Bir tarih ve saat seçin, sizi arayalım.
            </p>
          </div>
          <ArrowRight
            size={16}
            className="absolute right-5 top-5 text-black/30 transition-all group-hover:translate-x-0.5 group-hover:text-[#3c639f]"
          />
        </button>

        {/* WhatsApp — outbound link */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp:choice"
          data-track-label={`WhatsApp seçti (${channel.label} – ${pkg.name})`}
          className="group relative flex flex-col items-start gap-3 rounded-xl border border-black/[0.08] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#25D366]/40 hover:shadow-[0_12px_28px_-12px_rgba(37,211,102,0.30)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#25D366]/[0.10] text-[#25D366] transition-colors group-hover:bg-[#25D366] group-hover:text-white">
            <WhatsAppIcon size={22} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[#0a0a0a]">
              WhatsApp&apos;tan hemen yazın
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-black/55">
              {WHATSAPP_DISPLAY} numarasına mesaj atın.
            </p>
          </div>
          <ArrowRight
            size={16}
            className="absolute right-5 top-5 text-black/30 transition-all group-hover:translate-x-0.5 group-hover:text-[#25D366]"
          />
        </a>
      </div>
    </div>
  )

  const today = now ?? new Date()
  const scheduleView = (
    <div className="px-7 py-7 md:px-9 md:py-8">
      {/* Date strip — scrolls horizontally on overflow */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3c639f]">
            Tarih seçin
          </span>
          {earliest && (
            <span className="text-[12px] text-black/45">
              En erken: {formatDateChip(earliest, today).sub},{" "}
              {String(earliest.getHours()).padStart(2, "0")}:00
            </span>
          )}
        </div>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto pb-1 pl-1 pr-1 [scrollbar-width:thin]">
          {dateList.map((d) => {
            const active =
              selectedDate !== null && sameDay(d, selectedDate)
            const chip = formatDateChip(d, today)
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`shrink-0 rounded-lg border px-3.5 py-2.5 text-center transition-all ${
                  active
                    ? "border-[#3c639f] bg-[#3c639f] text-white shadow-[0_6px_16px_-6px_rgba(60,99,159,0.45)]"
                    : "border-black/[0.10] bg-white text-black/70 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
                }`}
              >
                <div
                  className={`text-[11.5px] font-medium uppercase tracking-[0.06em] ${
                    active ? "text-white/80" : "text-black/45"
                  }`}
                >
                  {chip.label}
                </div>
                <div className="mt-0.5 text-[14px] font-semibold">
                  {chip.sub}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hour grid */}
      <div className="mt-7">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3c639f]">
          Saat seçin
        </span>
        <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-8">
          {SLOT_HOURS.map((h) => {
            const enabled = validHours.includes(h)
            const active = selectedHour === h && enabled
            return (
              <button
                key={h}
                type="button"
                disabled={!enabled}
                onClick={() => setSelectedHour(h)}
                className={`rounded-lg border py-2.5 text-[13px] font-semibold transition-all ${
                  active
                    ? "border-[#3c639f] bg-[#3c639f] text-white shadow-[0_6px_16px_-6px_rgba(60,99,159,0.45)]"
                    : enabled
                    ? "border-black/[0.10] bg-white text-black/75 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
                    : "cursor-not-allowed border-black/[0.06] bg-black/[0.02] text-black/25"
                }`}
              >
                {String(h).padStart(2, "0")}:00
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[12px] text-black/45">
          Çalışma saatleri 10:00 – 18:00. Randevu için en az 3 saat önceden
          seçim yapılır.
        </p>
      </div>

      {/* Contact fields */}
      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Adınız <span className="text-black/30">(opsiyonel)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            className="rounded-lg border border-black/[0.10] bg-white px-3.5 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-black/55">
            Telefon
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+90 5XX XXX XX XX"
            className="rounded-lg border border-black/[0.10] bg-white px-3.5 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
          />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="text-[11.5px] font-medium text-black/55">
            E-posta{" "}
            <span className="text-black/30">
              (opsiyonel — onay maili için)
            </span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@firma.com"
            className="rounded-lg border border-black/[0.10] bg-white px-3.5 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-black/35 focus:border-[#3c639f]/50 focus:outline-none focus:ring-4 focus:ring-[#3c639f]/[0.08]"
          />
        </label>
      </div>
      {submitError && (
        <p className="mt-4 text-[13px] text-red-600">{submitError}</p>
      )}
    </div>
  )

  const successView = (
    <div className="px-7 py-10 text-center md:px-9 md:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3c639f]/[0.10]">
        <Check size={28} className="text-[#3c639f]" strokeWidth={2.5} />
      </div>
      <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
        Talebiniz alındı
      </h3>
      {selectedDate && selectedHour !== null && (
        <p className="mt-2 text-[14px] leading-relaxed text-black/65">
          {formatDateChip(selectedDate, today).sub} günü saat{" "}
          <strong className="font-semibold text-[#0a0a0a]">
            {String(selectedHour).padStart(2, "0")}:00
          </strong>{" "}
          civarında sizi arayacağız.
        </p>
      )}
      <p className="mt-1 text-[13px] text-black/45">
        Bu sürede WhatsApp&apos;tan da yazabilirsiniz.
      </p>
    </div>
  )

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />

      <div
        className="relative w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.30)] transition-all duration-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
        }}
      >
        <div className="h-[3px] w-full" style={{ background: theme.badgeGradient }} />

        {/* Header — back arrow appears on schedule/success views */}
        <div className="flex items-start justify-between gap-4 px-7 pt-6 md:px-9 md:pt-7">
          <div className="flex items-center gap-3">
            {view === "schedule" && (
              <button
                type="button"
                onClick={() => setView("choice")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/[0.05] hover:text-black/80"
                aria-label="Geri"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.10em] text-black/40">
                {headerLabel} · {pkg.price}/ay
              </span>
              <h3 className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[22px]">
                {view === "schedule"
                  ? "Sizi ne zaman arayalım?"
                  : view === "success"
                  ? "Teşekkürler"
                  : headerName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/45 transition-colors hover:bg-black/[0.05] hover:text-black/80"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {view === "choice" && choiceView}
        {view === "schedule" && scheduleView}
        {view === "success" && successView}

        {/* Footer — varies by view. Brand mark sits on the left in every
            footer so the popup feels owned by Webreta regardless of step. */}
        {view === "choice" && (
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#fafafa] px-7 py-4 md:px-9">
            <PopupBrand />
            <span className="text-[11.5px] text-black/40">
              Hızlı yanıt için WhatsApp&apos;ı tercih edin.
            </span>
          </div>
        )}

        {view === "schedule" && (
          <div className="flex flex-col gap-3 border-t border-black/[0.06] bg-[#fafafa] px-7 py-5 md:flex-row md:items-center md:justify-between md:px-9">
            <PopupBrand />
            <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp:schedule"
                data-track-label="WhatsApp (randevu sayfasından)"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-2.5 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.04]"
              >
                <WhatsAppIcon size={14} />
                WhatsApp
              </a>
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                data-track="randevu-olustur"
                data-track-label={`Randevu oluşturdu (${channel.label} – ${pkg.name})`}
                className="cta-primary inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-[13px] font-medium"
              >
                {submitting ? "Gönderiliyor…" : "Randevu Oluştur"}
                {!submitting && <ArrowRight size={15} />}
              </button>
            </div>
          </div>
        )}

        {view === "success" && (
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#fafafa] px-7 py-5 md:px-9">
            <PopupBrand />
            <button
              onClick={onClose}
              className="cta-primary inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-[13px] font-medium"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

// ── Package card ────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  channel,
  isFeatured,
  isOpen,
  onOpen,
  onToggleAccordion,
  onRequest,
}: {
  pkg: Pkg
  channel: Channel
  isFeatured: boolean
  isOpen: boolean
  onOpen: () => void
  onToggleAccordion: () => void
  onRequest: () => void
}) {
  const theme = THEMES[channel.key]

  // Featured: static channel-colored conic ring (no rotation) + a brand-
  // navy "En Popüler" badge with a glossy shimmer. The wrapper carries
  // the gradient as its background; the inner white card masks all but a
  // 2px perimeter, leaving the colored ring.
  return (
    <div className="relative flex flex-col">
      {isFeatured && (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <span className="popular-badge inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.10em] text-white">
            <span aria-hidden className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
            <span className="relative">En Popüler</span>
          </span>
        </div>
      )}

      <div
        className={`relative flex flex-1 flex-col rounded-2xl transition-transform duration-500 hover:-translate-y-1 ${
          isFeatured ? "p-[2px]" : "border border-black/[0.10] bg-white"
        }`}
        style={
          isFeatured
            ? {
                background: theme.ringGradient,
                boxShadow: `0 30px 60px -12px ${theme.glow}, 0 14px 28px -8px ${theme.glow}, 0 4px 10px -2px rgba(15, 23, 42, 0.10)`,
              }
            : undefined
        }
      >
        {/* Inner card — white surface with all the content */}
        <div
          className={`relative flex flex-1 flex-col bg-white p-7 md:p-8 ${
            isFeatured ? "rounded-[14px]" : "rounded-2xl"
          }`}
        >
          {/* Channel mark + label row */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: theme.softTint }}
            >
              <ChannelMark channel={channel.key} size={20} />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.10em] text-black/45">
              {channel.label}
            </span>
          </div>

          <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            {pkg.name}
          </h3>
          <p className="mt-1.5 min-h-[40px] text-[13.5px] leading-relaxed text-black/55">
            {pkg.tagline}
          </p>

          {/* Price — clean typography, no plate */}
          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="text-[36px] font-bold tracking-[-0.03em] text-[#0a0a0a]">
              {pkg.price}
            </span>
            <span className="text-[13px] text-black/45">/ay</span>
          </div>

          {/* Hairline divider */}
          <div className="mt-5 h-px w-full bg-black/[0.07]" />

          {/* Audience */}
          <div className="mt-5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#3c639f]">
              Kimler için uygun
            </span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {pkg.audience.map((a) => (
                <li
                  key={a}
                  className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-black/70"
                >
                  <Check
                    size={15}
                    className="mt-[3px] shrink-0 text-[#3c639f]"
                    strokeWidth={2.5}
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary CTA — opens the request flow modal (WhatsApp / callback).
              Channel hint icons sit on the left so the user sees both
              options before clicking. */}
          <button
            type="button"
            data-track={`talep-edin:${channel.key}:${pkg.key}`}
            data-track-label={`Talep Edin (${channel.label} – ${pkg.name})`}
            onClick={onRequest}
            className="cta-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-[13px] font-medium"
          >
            <span className="inline-flex items-center gap-1.5">
              <WhatsAppIcon size={14} />
              <Phone size={14} strokeWidth={2.25} />
            </span>
            <span>Talep Edin</span>
          </button>

          {/* Secondary — desktop opens details modal, mobile toggles
              the inline accordion below. */}
          <button
            type="button"
            data-track={`detaylari-gor:${channel.key}:${pkg.key}`}
            data-track-label={`Detayları Gör (${channel.label} – ${pkg.name})`}
            onClick={() => {
              if (window.matchMedia("(min-width: 768px)").matches) {
                onOpen()
              } else {
                onToggleAccordion()
              }
            }}
            aria-expanded={isOpen}
            className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#3c639f]/25 bg-[#3c639f]/[0.06] px-5 py-2.5 text-[13px] font-semibold text-[#3c639f] transition-all hover:border-[#3c639f]/45 hover:bg-[#3c639f]/[0.12]"
          >
            <span>Detayları Gör</span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-300 md:hidden ${
                isOpen ? "rotate-180" : ""
              }`}
            />
            <ArrowRight
              size={15}
              className="hidden md:inline-block"
            />
          </button>

          {/* Mobile-only accordion. Desktop uses the modal. Same items as
              the desktop modal, capped at 12, single column for legibility
              on small screens. */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
              isOpen ? "mt-5 grid-rows-[1fr]" : "mt-0 grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="border-t border-black/[0.08] pt-5">
                <ul className="flex flex-col gap-2.5">
                  {pkg.items.slice(0, 12).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-black/70"
                      >
                        <Check
                          size={15}
                          className="mt-[3px] shrink-0 text-[#3c639f]"
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────

export default function DijitalReklamlarClient({
  channels,
}: {
  channels: Channel[]
}) {
  // Fall through to "google" if the admin somehow ships an empty channels
  // array — keeps the page from crashing while we debug.
  const initialChannel: ChannelKey = channels[0]?.key ?? "google"
  const [activeChannel, setActiveChannel] = useState<ChannelKey>(initialChannel)
  // Mobile accordion open key. `null` = all collapsed.
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  // Desktop detail modal selection.
  const [modalPkg, setModalPkg] = useState<{
    channel: Channel
    pkg: Pkg
  } | null>(null)
  // Request flow modal — both desktop and mobile.
  const [requestPkg, setRequestPkg] = useState<{
    channel: Channel
    pkg: Pkg
  } | null>(null)

  const channel =
    channels.find((c) => c.key === activeChannel) ?? channels[0]
  const theme = THEMES[activeChannel] ?? THEMES.google

  return (
    <>
      <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-16">
        <div className="text-center">
          <h1 className="text-[36px] leading-[1.1] tracking-[-0.02em] text-[#0a0a0a] md:text-[48px]">
            <span className="font-bold text-[#3c639f]">{channel.label}</span>
          </h1>
          <p className="mx-auto mt-4 text-[15px] leading-relaxed text-black/60 md:whitespace-nowrap">
            {channel.intro}
          </p>
        </div>

        {/* Channel tabs — same segmented-control language as the homepage
            projects section. Active chip carries a thin channel-tinted dot
            so the user feels which palette they're on. */}
        <div className="mt-10 flex justify-center">
          <div
            className="inline-flex shrink-0 items-center rounded-full p-1"
            style={{
              background: "#f1f3f7",
              border: "1px solid rgba(60, 99, 159, 0.08)",
            }}
          >
            {channels.map((c) => {
              const active = activeChannel === c.key
              const t = THEMES[c.key]
              return (
                <button
                  key={c.key}
                  type="button"
                  data-track-tab-control="channel"
                  data-track-tab-value={c.key}
                  data-track-label={c.label}
                  onClick={() => {
                    setActiveChannel(c.key)
                    setOpenAccordion(null)
                  }}
                  className="relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors md:px-6"
                  style={{
                    background: active ? "#ffffff" : "transparent",
                    color: active ? "#0a0a0a" : "rgba(0,0,0,0.5)",
                    boxShadow: active
                      ? `0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px -4px ${t.glow}`
                      : "none",
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
                    style={{
                      background: active ? t.primary : "rgba(0,0,0,0.20)",
                    }}
                  />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pricing cards. We give the row a key tied to active channel so
            the cards remount on tab switch — this restarts the featured
            ring rotation phase and creates a subtle fade-in via CSS. */}
        <div
          key={activeChannel}
          className="card-grid mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7"
        >
          {channel.packages.map((pkg, idx) => {
            const isFeatured = pkg.key === "growth"
            const accordionKey = `${channel.key}:${pkg.key}`
            const isOpen = openAccordion === accordionKey
            return (
              <div
                key={pkg.key}
                className="card-enter"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <PackageCard
                  pkg={pkg}
                  channel={channel}
                  isFeatured={isFeatured}
                  isOpen={isOpen}
                  onOpen={() => setModalPkg({ channel, pkg })}
                  onToggleAccordion={() =>
                    setOpenAccordion(isOpen ? null : accordionKey)
                  }
                  onRequest={() => setRequestPkg({ channel, pkg })}
                />
              </div>
            )
          })}
        </div>
      </main>

      {modalPkg && (
        <DetailModal
          pkg={modalPkg.pkg}
          channel={modalPkg.channel}
          onClose={() => setModalPkg(null)}
        />
      )}

      {requestPkg && (
        <RequestModal
          key={`${requestPkg.channel.key}:${requestPkg.pkg.key}`}
          pkg={requestPkg.pkg}
          channel={requestPkg.channel}
          onClose={() => setRequestPkg(null)}
        />
      )}

      {/* Page-scoped animations */}
      <style jsx global>{`
        /* "En Popüler" badge — brand-navy glossy pill with a slow shimmer
           sweep. Uses the same gradient family as .cta-primary (the global
           shimmer button) so it feels native, plus an inset top highlight
           for a glassy look. */
        .popular-badge {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            #5b8de6 0%,
            #3c639f 50%,
            #2f5288 100%
          );
          box-shadow:
            0 12px 30px -6px rgba(60, 99, 159, 0.55),
            0 4px 10px -2px rgba(47, 82, 136, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.30);
        }
        .popular-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 100%
          );
          transform: skewX(-18deg);
          animation: popularShimmer 4.5s ease-in-out infinite;
          animation-delay: 0.8s;
          pointer-events: none;
        }
        @keyframes popularShimmer {
          0%, 75%, 100% { left: -40%; opacity: 0; }
          77% { opacity: 1; }
          92% { left: 100%; opacity: 1; }
          95% { opacity: 0; }
        }
        /* Card grid entrance — soft fade + lift on tab switch. The grid
           key forces remount so this plays every channel change. */
        .card-enter {
          animation: cardEnter 360ms ease-out both;
        }
        @keyframes cardEnter {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .popular-badge::before,
          .card-enter {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}

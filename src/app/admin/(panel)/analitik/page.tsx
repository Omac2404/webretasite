import Link from "next/link"
import { headers } from "next/headers"
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  Eye,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  PieChart,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react"
import {
  clickReach,
  dayKey,
  listVisitorsFrom,
  monthBuckets,
  monthKey,
  readEvents,
  sectionDwellSummary,
  tabReach,
  topClicksByPrefix,
  topClicksOnPath,
  visitorsOnPath,
  type Reach,
  type Tally,
  type Visitor,
} from "@/lib/analytics-store"
import { readAnalyticsSettings } from "@/lib/analytics-settings"
import { EVENT_LABEL, sectionLabel, type StoredEvent } from "@/lib/analytics-types"
import { listPublished } from "@/lib/blog-store"
import { setEnabledAction } from "./actions"
import { ResetDialog } from "./reset-dialog"

export const dynamic = "force-dynamic"

// ── Helpers ──────────────────────────────────────────────────────────

async function getOwnIp(): Promise<string> {
  const h = await headers()
  const xff = h.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const xri = h.get("x-real-ip")
  if (xri) return xri.trim()
  return "127.0.0.1"
}

const TR_DATE_TIME = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  day: "2-digit",
  month: "short",
})

const TR_DAY_FULL = new Intl.DateTimeFormat("tr-TR", {
  weekday: "short",
  day: "numeric",
  month: "short",
})

const TR_MONTH_FULL = new Intl.DateTimeFormat("tr-TR", {
  month: "long",
  year: "numeric",
})

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s önce`
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} dk önce`
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)} sa önce`
  return `${Math.round(ms / 86_400_000)} gün önce`
}

function browserName(ua: string): string {
  if (!ua) return "?"
  if (ua.includes("Edg/")) return "Edge"
  if (ua.includes("Chrome/")) return "Chrome"
  if (ua.includes("Firefox/")) return "Firefox"
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari"
  if (ua.includes("bot") || ua.includes("Bot")) return "Bot"
  return "Diğer"
}

function osName(ua: string): string {
  if (!ua) return "?"
  if (ua.includes("Windows")) return "Windows"
  if (ua.includes("Macintosh") || ua.includes("Mac OS X")) return "macOS"
  if (ua.includes("Android")) return "Android"
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS"
  if (ua.includes("Linux")) return "Linux"
  return "?"
}

type Device = "Mobil" | "Tablet" | "Masaüstü" | "?"
function deviceType(ua: string): Device {
  if (!ua) return "?"
  if (/iPad/.test(ua)) return "Tablet"
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "Tablet"
  if (/Mobile|iPhone|Android|iPod/.test(ua)) return "Mobil"
  return "Masaüstü"
}

function DeviceIcon({ device }: { device: Device }) {
  if (device === "Mobil") return <Smartphone size={12} />
  if (device === "Tablet") return <Tablet size={12} />
  if (device === "Masaüstü") return <MonitorSmartphone size={12} />
  return <Globe2 size={12} />
}

function formatDayLabel(day: string, today: string): string {
  if (day === today) return "Bugün"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = yesterday.toISOString().slice(0, 10)
  if (day === yKey) return "Dün"
  return TR_DAY_FULL.format(new Date(day + "T12:00:00"))
}

function formatMonthLabel(month: string): string {
  return TR_MONTH_FULL.format(new Date(month + "-01T12:00:00"))
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "0sn"
  const totalSec = Math.round(ms / 1000)
  if (totalSec < 60) return `${totalSec}sn`
  const m = Math.floor(totalSec / 60)
  const s = totalSec - m * 60
  if (m < 60) return s === 0 ? `${m}dk` : `${m}dk ${s}sn`
  const h = Math.floor(m / 60)
  const mm = m - h * 60
  return mm === 0 ? `${h}sa` : `${h}sa ${mm}dk`
}

// ── Visitor tags ─────────────────────────────────────────────────────
// Per spec the visitor row only surfaces two activity flavours: a
// successful form submission, and a WhatsApp-with-package click. Every
// other interaction is aggregated into the cards above and shouldn't
// clutter the per-visitor row.

type Tag = { label: string; color: "emerald" | "green" | "blue" }

const FORM_LABEL: Record<string, string> = {
  contact: "İletişim",
  quote: "Teklif",
  randevu: "Randevu",
}

function visitorTags(visitor: Visitor): Tag[] {
  const seen = new Set<string>()
  const out: Tag[] = []
  for (const e of visitor.events) {
    if (e.type !== "click") continue
    const target = String(e.data?.target ?? "")
    if (target.startsWith("form-submit:")) {
      const key = target.slice("form-submit:".length)
      const label = `${FORM_LABEL[key] ?? key} formu gönderdi`
      if (!seen.has(label)) {
        seen.add(label)
        out.push({ label, color: "emerald" })
      }
    } else if (target.startsWith("whatsapp:pkg:")) {
      // The package name lives in the click event's `label` data field
      // (we set it as "<channel> – <pkg name>"). Surface the pkg name when
      // possible; fall back to a generic tag.
      const lbl = String(e.data?.label ?? "")
      const pkgName = lbl.includes("–") ? lbl.split("–").pop()?.trim() : lbl
      const finalLabel = pkgName
        ? `${pkgName} paketi WhatsApp'ına tıkladı`
        : "WhatsApp'a tıkladı"
      if (!seen.has(finalLabel)) {
        seen.add(finalLabel)
        out.push({ label: finalLabel, color: "green" })
      }
    }
  }
  return out.slice(0, 6)
}

const TAG_COLOR: Record<Tag["color"], string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
}

// ── Page selector ────────────────────────────────────────────────────
// Per-page stat cards live in a sub-tab; we ship "Anasayfa" first and
// will add more pages as the admin requests them. Keep the list here so
// it's trivial to extend.

type PageTab = {
  id: string
  label: string
  path: string
  comingSoon?: boolean
}

const PAGE_TABS: PageTab[] = [
  { id: "home", label: "Anasayfa", path: "/" },
  { id: "hakkimizda", label: "Hakkımızda", path: "/hakkimizda" },
  { id: "web-site", label: "Web Site", path: "/web-site" },
  {
    id: "dijital-reklamlar",
    label: "Dijital Reklamlar",
    path: "/dijital-reklamlar",
  },
  { id: "referanslar", label: "Referanslar", path: "/referanslar" },
  { id: "iletisim", label: "İletişim", path: "/iletisim" },
  { id: "bloglar", label: "Bloglar", path: "/blog" },
]

// Targets we hide from "Anasayfada en çok tıklananlar" — those are
// already surfaced as their own cards or aren't useful as raw clicks.
const HOME_TOP_CLICK_HIDDEN_PREFIXES = ["form-submit:", "whatsapp:"]

// Home service card targets — used both for the multi-target reach and
// to filter them out of the raw top-5 list if desired (we keep them in
// so the list shows the most-clicked items including service cards).
const HOME_SERVICE_CARD_TARGETS = new Set<string>([
  "home:service-card:web-site",
  "home:service-card:dijital-reklamlar",
])

// ── Page ──────────────────────────────────────────────────────────────

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; month?: string; page?: string }>
}) {
  const params = await searchParams
  const rawDay = params.day?.trim() ?? ""
  const rawMonth = params.month?.trim() ?? ""
  const rawPage = params.page?.trim() ?? ""

  const [allEvents, ownIp, settings, blogPosts] = await Promise.all([
    readEvents(),
    getOwnIp(),
    readAnalyticsSettings(),
    listPublished(),
  ])
  const months = monthBuckets(allEvents)
  const todayKey = dayKey(new Date().toISOString())

  // Resolve filter: explicit day wins; otherwise explicit month; otherwise all.
  const validDay = rawDay && /^\d{4}-\d{2}-\d{2}$/.test(rawDay) ? rawDay : null
  const validMonth = validDay
    ? validDay.slice(0, 7)
    : rawMonth && /^\d{4}-\d{2}$/.test(rawMonth)
      ? rawMonth
      : null

  // Scope events for stats + visitors.
  const scopeEvents = validDay
    ? allEvents.filter((e) => dayKey(e.ts) === validDay)
    : validMonth
      ? allEvents.filter((e) => monthKey(e.ts) === validMonth)
      : allEvents

  const chartMonth =
    validMonth ??
    months[0]?.month ??
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

  const visitors = listVisitorsFrom(scopeEvents)
  const own = visitors.find((v) => v.ip === ownIp)
  const others = visitors.filter((v) => v.ip !== ownIp)
  const scopeLabel = validDay
    ? formatDayLabel(validDay, todayKey)
    : validMonth
      ? formatMonthLabel(validMonth)
      : "Tüm zamanlar"

  // Device breakdown over the scoped visitors.
  const deviceCounts = { Masaüstü: 0, Mobil: 0, Tablet: 0, "?": 0 }
  for (const v of visitors) deviceCounts[deviceType(v.userAgent)] += 1
  const deviceTotal = visitors.length

  // ── General cards ────────────────────────────────────────────────────
  const headerNavClicks = topClicksByPrefix(scopeEvents, "header:nav:", 5)
  const homeTopClicks = topClicksOnPath(
    scopeEvents,
    "/",
    5,
    (t) => !HOME_TOP_CLICK_HIDDEN_PREFIXES.some((p) => t.startsWith(p)),
  )

  // Session-length distribution. Per-visitor duration is the gap between
  // the first and last event we observed for that IP in the scoped
  // window. Buckets are mutually exclusive: each visitor counts in
  // exactly one tier (highest one they qualify for).
  const sessionMs = visitors.map(
    (v) => new Date(v.lastSeen).getTime() - new Date(v.firstSeen).getTime(),
  )
  const sessionBuckets = {
    total: visitors.length,
    under30s: sessionMs.filter((ms) => ms < 30_000).length,
    over1m: sessionMs.filter((ms) => ms > 60_000 && ms <= 180_000).length,
    over3m: sessionMs.filter((ms) => ms > 180_000 && ms <= 300_000).length,
    over5m: sessionMs.filter((ms) => ms > 300_000).length,
  }

  // ── Per-page (home) cards ────────────────────────────────────────────
  const activePageTab =
    PAGE_TABS.find((p) => p.id === rawPage && !p.comingSoon) ?? PAGE_TABS[0]

  const homeVisitorCount = visitorsOnPath(scopeEvents, "/").size
  const partnerReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "home:partner-badge",
    "/",
  )
  const googleReviewsReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "home:google-reviews:view",
    "/",
  )
  const testimonialsDwell = sectionDwellSummary(scopeEvents, "testimonials")
  const projectsDwell = sectionDwellSummary(scopeEvents, "projects")
  const opsTabReach: Reach = tabReach(scopeEvents, "projects", "ops", "/")
  const serviceCardsReach: Reach = clickReach(
    scopeEvents,
    (t) => HOME_SERVICE_CARD_TARGETS.has(t),
    "/",
  )

  // ── Per-page (hakkımızda) cards ──────────────────────────────────────
  const hakkimizdaKobiReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "hakkimizda:row2-cta",
    "/hakkimizda",
  )
  const hakkimizdaIletisimReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "hakkimizda:cta",
    "/hakkimizda",
  )

  // ── Per-page (web-site) cards ────────────────────────────────────────
  // Quote wizard funnel: each step's "reached" event fires when the
  // visitor clicks "İlerle" and ends up on that step. Step 1 is the
  // landing step (no event); we only count 2/3/4 as funnel progress.
  const quoteStep2Reach: Reach = clickReach(
    scopeEvents,
    (t) => t === "quote:step-reached:2",
    "/web-site",
  )
  const quoteStep3Reach: Reach = clickReach(
    scopeEvents,
    (t) => t === "quote:step-reached:3",
    "/web-site",
  )
  const quoteStep4Reach: Reach = clickReach(
    scopeEvents,
    (t) => t === "quote:step-reached:4",
    "/web-site",
  )
  const quoteSubmitReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "form-submit:quote",
    "/web-site",
  )
  const quoteKobiPopupReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "web-site:kobi-popup",
    "/web-site",
  )
  const webSiteKobiBannerReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "web-site:kobi-banner",
    "/web-site",
  )

  // ── Per-page (dijital-reklamlar) cards ───────────────────────────────
  // Channel tabs: tab_change events with control="channel", value=key.
  // Package interactions: clicks prefixed with the action key, suffixed
  // with "<channel>:<package>". We aggregate across all packages so the
  // card answers "kaç kişi HERHANGİ bir paketin X'ine bastı".
  const dijitalGoogleTabReach: Reach = tabReach(
    scopeEvents,
    "channel",
    "google",
    "/dijital-reklamlar",
  )
  const dijitalMetaTabReach: Reach = tabReach(
    scopeEvents,
    "channel",
    "meta",
    "/dijital-reklamlar",
  )
  const dijital360TabReach: Reach = tabReach(
    scopeEvents,
    "channel",
    "360",
    "/dijital-reklamlar",
  )
  const dijitalDetayReach: Reach = clickReach(
    scopeEvents,
    (t) => t.startsWith("detaylari-gor:"),
    "/dijital-reklamlar",
  )
  const dijitalTalepReach: Reach = clickReach(
    scopeEvents,
    (t) => t.startsWith("talep-edin:"),
    "/dijital-reklamlar",
  )
  const dijitalRandevuReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "form-submit:randevu",
    "/dijital-reklamlar",
  )
  const dijitalWhatsappReach: Reach = clickReach(
    scopeEvents,
    (t) => t.startsWith("whatsapp:pkg:"),
    "/dijital-reklamlar",
  )

  // ── Per-page (iletisim) cards ────────────────────────────────────────
  const iletisimEmailReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "iletisim:email",
    "/iletisim",
  )
  const iletisimPhoneReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "iletisim:phone",
    "/iletisim",
  )
  const iletisimFormReach: Reach = clickReach(
    scopeEvents,
    (t) => t === "form-submit:contact",
    "/iletisim",
  )

  // ── Per-page (referanslar) cards ─────────────────────────────────────
  // How many landed on the references page, how long they lingered on the
  // grid, which category they switched to, and which individual references
  // they clicked through to ("Projeyi gör"). Per-reference clicks carry a
  // "referanslar:proje:<id>" target with the company name as label.
  const referanslarVisitorCount = visitorsOnPath(
    scopeEvents,
    "/referanslar",
  ).size
  const referanslarDwell = sectionDwellSummary(scopeEvents, "referanslar")
  const referanslarOpsTabReach: Reach = tabReach(
    scopeEvents,
    "referanslar",
    "ops",
    "/referanslar",
  )
  const referanslarTopClicks = topClicksOnPath(
    scopeEvents,
    "/referanslar",
    10,
    (t) => t.startsWith("referanslar:proje:"),
  )

  // ── Per-page (bloglar) cards ─────────────────────────────────────────
  // Count page_view events on /blog/<slug> paths, then merge with the
  // published-blog list so newly-published posts with 0 views still
  // appear. Sorted by view count desc.
  const blogViewCounts = new Map<string, number>()
  for (const e of scopeEvents) {
    if (e.type !== "page_view") continue
    const m = /^\/blog\/([^/?#]+)/.exec(e.path)
    if (!m) continue
    const slug = decodeURIComponent(m[1])
    blogViewCounts.set(slug, (blogViewCounts.get(slug) ?? 0) + 1)
  }
  const blogStats = blogPosts
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      views: blogViewCounts.get(p.slug) ?? 0,
    }))
    .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title, "tr"))

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Analitik
          </h1>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <a
              href="/admin/analitik/export"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.10] bg-white px-3 py-1.5 text-[11.5px] font-medium text-black/65 transition-colors hover:border-[#3c639f]/30 hover:text-[#3c639f]"
              title="Tüm olayları CSV olarak indir"
            >
              CSV indir
            </a>
            <ResetDialog />
            <div className="flex items-center gap-1 rounded-full border border-black/[0.10] bg-white p-1">
              <ToggleButton enabled={settings.enabled} value="true">
                Aktif
              </ToggleButton>
              <ToggleButton enabled={!settings.enabled} value="false">
                Pasif
              </ToggleButton>
            </div>
          </div>
          <span
            className={`text-[11px] ${
              settings.enabled ? "text-emerald-700" : "text-black/45"
            }`}
          >
            {settings.enabled
              ? "Olaylar kaydediliyor"
              : "Yeni olaylar kaydedilmiyor"}
          </span>
        </div>
      </header>

      {/* Filter toolbar — thin, single-row. Month dropdown + day picker
          live in one form so submitting applies both together. Day wins
          when both are set (the page handler enforces this). */}
      <section className="rounded-xl border border-black/[0.06] bg-white px-3 py-2">
        <form
          action="/admin/analitik"
          method="GET"
          className="flex flex-wrap items-center gap-2 text-[12px]"
        >
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-black/45">
            <CalendarDays size={12} />
            Filtrele
          </span>

          <label className="inline-flex items-center gap-1.5">
            <span className="text-black/50">Ay</span>
            <select
              name="month"
              defaultValue={validMonth ?? ""}
              className="rounded-md border border-black/[0.10] bg-white px-2 py-1 text-[12px] text-[#0a0a0a] focus:border-[#3c639f]/50 focus:outline-none"
            >
              <option value="">Tüm aylar</option>
              {months.map((m) => (
                <option key={m.month} value={m.month}>
                  {formatMonthLabel(m.month)} · {m.events}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-1.5">
            <span className="text-black/50">Gün</span>
            <input
              type="date"
              name="day"
              defaultValue={validDay ?? ""}
              className="rounded-md border border-black/[0.10] bg-white px-2 py-1 text-[12px] text-[#0a0a0a] focus:border-[#3c639f]/50 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-[#3c639f] px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-[#2f5288]"
          >
            Uygula
          </button>

          <Link
            href={`/admin/analitik?day=${todayKey}`}
            aria-current={validDay === todayKey ? "page" : undefined}
            className={`rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
              validDay === todayKey
                ? "border-[#3c639f] bg-[#3c639f]/[0.08] text-[#3c639f]"
                : "border-black/[0.10] bg-white text-black/65 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
            }`}
          >
            Bugün
          </Link>

          {(validDay || validMonth) && (
            <Link
              href="/admin/analitik"
              className="rounded-md border border-black/[0.10] bg-white px-2.5 py-1 text-[11.5px] font-medium text-black/55 transition-colors hover:bg-black/[0.03]"
            >
              Tümü
            </Link>
          )}

          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-black/50">
            Aktif:
            <span className="rounded-full bg-[#3c639f]/[0.08] px-2 py-0.5 text-[11px] font-medium text-[#3c639f]">
              {scopeLabel}
            </span>
          </span>
        </form>
      </section>

      {/* ── Genel istatistikler ──────────────────────────────────────── */}
      <SectionHeader
        title="Genel istatistikler"
        sub="Tüm sayfaları kapsayan kartlar"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <ListCard
          icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
          title="Header'da en çok tıklanan sekme"
          empty="Henüz nav tıklaması yok."
          rows={headerNavClicks.map((r) => ({
            ...r,
            // Use the stored label (the visible nav text) when present —
            // it reads better than the raw `header:nav:slug` key.
            display: r.meta ?? humanizeHeaderNav(r.key),
          }))}
        />

        <DeviceCard
          counts={deviceCounts}
          total={deviceTotal}
          scopeLabel={scopeLabel}
        />

        <VisitorDurationCard buckets={sessionBuckets} />
      </div>

      {/* ── Sayfa bazlı istatistikler ────────────────────────────────── */}
      <SectionHeader
        title="Sayfa bazlı istatistikler"
        sub="Bir sayfa seçin, o sayfaya özel kartlar gelsin"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {PAGE_TABS.map((tab) => {
          const isActive = tab.id === activePageTab.id
          const href = buildHref({
            day: validDay,
            month: validMonth,
            page: tab.id === "home" ? null : tab.id,
          })
          if (tab.comingSoon) {
            return (
              <span
                key={tab.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-black/[0.12] bg-white px-3 py-1.5 text-[12px] font-medium text-black/35"
                title="Yakında"
              >
                {tab.label}
                <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-black/40">
                  Yakında
                </span>
              </span>
            )
          }
          return (
            <Link
              key={tab.id}
              href={href}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                isActive
                  ? "border-[#3c639f] bg-[#3c639f] text-white"
                  : "border-black/[0.10] bg-white text-black/65 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {activePageTab.id === "home" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ListCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Anasayfa — en çok tıklanan ilk 5"
            empty="Anasayfada henüz tıklama yok."
            rows={homeTopClicks.map((r) => ({
              ...r,
              display: r.meta ?? r.key,
            }))}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Partner badge"
            sub="Google Partner rozeti tıklaması"
            reach={partnerReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Yorumları Google'da görüntüle"
            sub="Yorumlar bölümünün altındaki CTA"
            reach={googleReviewsReach}
          />

          <DwellCard
            icon={<Clock size={14} className="text-[#3c639f]" />}
            title="Yorumlarda durma süresi"
            visitorsOnPage={homeVisitorCount}
            dwell={testimonialsDwell}
          />

          <DwellCard
            icon={<Clock size={14} className="text-[#3c639f]" />}
            title="Projelerde durma süresi"
            visitorsOnPage={homeVisitorCount}
            dwell={projectsDwell}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Operasyonlar sekmesi"
            sub="Projeler bölümünde 'Operasyonlar' sekmesine geçen"
            reach={opsTabReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Hizmet kartları"
            sub="Web Site veya Dijital Reklamlar kartına tıklayan"
            reach={serviceCardsReach}
          />
        </div>
      )}

      {activePageTab.id === "hakkimizda" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Webreta KOBİ butonu"
            sub="'Nasıl Gidiyor?' bölümündeki KOBİ CTA'sı"
            reach={hakkimizdaKobiReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="İletişim butonu"
            sub="Sayfanın altındaki 'İletişime geç' CTA'sı"
            reach={hakkimizdaIletisimReach}
          />
        </div>
      )}

      {activePageTab.id === "web-site" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Teklif aracı — 2. adım"
            sub="Sektör & Hizmet'i tamamlayıp Paket Seçimi'ne geçen"
            reach={quoteStep2Reach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Teklif aracı — 3. adım"
            sub="Paket Seçimi'ni tamamlayıp Örnek Siteler'e geçen"
            reach={quoteStep3Reach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Teklif aracı — 4. adım"
            sub="Örnek Siteler'i tamamlayıp İletişim adımına geçen"
            reach={quoteStep4Reach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Teklif gönderenler"
            sub="Tüm adımları tamamlayıp formu gönderen"
            reach={quoteSubmitReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Paket seçimi → KOBİ popup"
            sub="2. adımda açılan popup'tan KOBİ'ye geçen"
            reach={quoteKobiPopupReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Teklif aracı altı — KOBİ banner"
            sub="Sayfa altındaki 'Webreta KOBİ'yi keşfet' butonu"
            reach={webSiteKobiBannerReach}
          />
        </div>
      )}

      {activePageTab.id === "dijital-reklamlar" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Google Ads tabı"
            sub="Google Ads sekmesini görüntüleyen"
            reach={dijitalGoogleTabReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Meta Ads tabı"
            sub="Meta Ads sekmesini görüntüleyen"
            reach={dijitalMetaTabReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Google + Meta tabı"
            sub="360° sekmesini görüntüleyen"
            reach={dijital360TabReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Paket — Detaylar butonu"
            sub="Herhangi bir pakette 'Detayları Gör' tıklayan"
            reach={dijitalDetayReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Paket — Talep Edin butonu"
            sub="Herhangi bir pakette 'Talep Edin' tıklayan"
            reach={dijitalTalepReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Paket — Talep formu gönderenler"
            sub="Herhangi bir pakette randevu formunu tamamlayan"
            reach={dijitalRandevuReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Paket — WhatsApp butonu"
            sub="Herhangi bir pakette WhatsApp seçen"
            reach={dijitalWhatsappReach}
          />
        </div>
      )}

      {activePageTab.id === "iletisim" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="E-posta kartı"
            sub="E-posta adresine tıklayan (mailto)"
            reach={iletisimEmailReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Telefon kartı"
            sub="Telefon numarasına tıklayan (tel)"
            reach={iletisimPhoneReach}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="İletişim formu"
            sub="Formu başarıyla gönderen"
            reach={iletisimFormReach}
          />
        </div>
      )}

      {activePageTab.id === "referanslar" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DwellCard
            icon={<Clock size={14} className="text-[#3c639f]" />}
            title="Sayfada durma süresi"
            visitorsOnPage={referanslarVisitorCount}
            dwell={referanslarDwell}
          />

          <ReachCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="Operasyonlar sekmesi"
            sub="Referanslar sayfasında 'Operasyonlar' sekmesine geçen"
            reach={referanslarOpsTabReach}
          />

          <ListCard
            icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
            title="En çok tıklanan referanslar"
            empty="Henüz 'Projeyi gör' tıklaması yok."
            rows={referanslarTopClicks.map((r) => ({
              ...r,
              display: (r.meta ?? r.key).replace(/^Projeyi gör — /, ""),
            }))}
          />
        </div>
      )}

      {activePageTab.id === "bloglar" && (
        <BlogStats stats={blogStats} scopeLabel={scopeLabel} />
      )}

      {/* Visitors */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <BarChart3 size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Ziyaretçiler ({scopeLabel})
          </div>
        </div>

        {visitors.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Bu aralıkta hiç olay yok.
            {(validDay || validMonth) && (
              <>
                {" "}
                <Link
                  href="/admin/analitik"
                  className="font-medium text-[#3c639f] underline underline-offset-2"
                >
                  Tüm zamanlara dön
                </Link>
              </>
            )}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {own && <VisitorRow visitor={own} isSelf ownIp={ownIp} />}
            {others.map((v) => (
              <VisitorRow key={v.ip} visitor={v} isSelf={false} ownIp={ownIp} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// ── URL helpers ───────────────────────────────────────────────────────

function buildHref(opts: {
  day: string | null
  month: string | null
  page: string | null
}): string {
  const params = new URLSearchParams()
  if (opts.day) params.set("day", opts.day)
  else if (opts.month) params.set("month", opts.month)
  if (opts.page) params.set("page", opts.page)
  const qs = params.toString()
  return qs ? `/admin/analitik?${qs}` : "/admin/analitik"
}

const HEADER_NAV_LABEL: Record<string, string> = {
  "header:nav:hakkimizda": "Hakkımızda",
  "header:nav:web-site": "Web Site",
  "header:nav:dijital-reklamlar": "Dijital Reklamlar",
  "header:nav:referanslar": "Referanslar",
  "header:nav:iletisim": "İletişim",
  "header:blog-cta": "Blog (CTA)",
}

function humanizeHeaderNav(key: string): string {
  return HEADER_NAV_LABEL[key] ?? key
}

// ── UI bits ──────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
        {title}
      </h2>
      <p className="text-[12.5px] text-black/50">{sub}</p>
    </div>
  )
}

function ToggleButton({
  enabled,
  value,
  children,
}: {
  enabled: boolean
  value: "true" | "false"
  children: React.ReactNode
}) {
  return (
    <form action={setEnabledAction}>
      <input type="hidden" name="enabled" value={value} />
      <button
        type="submit"
        className={
          enabled
            ? value === "true"
              ? "rounded-full bg-emerald-600 px-3 py-1 text-[12px] font-semibold text-white"
              : "rounded-full bg-black/70 px-3 py-1 text-[12px] font-semibold text-white"
            : "rounded-full px-3 py-1 text-[12px] font-medium text-black/55 transition-colors hover:text-[#0a0a0a]"
        }
      >
        {children}
      </button>
    </form>
  )
}

function CardShell({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-[12.5px] font-semibold text-[#0a0a0a]">
          {title}
        </div>
      </div>
      {sub && <p className="mt-1 text-[11.5px] text-black/45">{sub}</p>}
      <div className="mt-3 flex-1">{children}</div>
    </div>
  )
}

function ListCard({
  icon,
  title,
  empty,
  rows,
}: {
  icon: React.ReactNode
  title: string
  empty: string
  rows: (Tally & { display?: string })[]
}) {
  return (
    <CardShell icon={icon} title={title}>
      {rows.length === 0 ? (
        <p className="text-[12.5px] text-black/40">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-baseline justify-between gap-2 text-[12.5px]"
            >
              <span className="min-w-0 truncate text-black/75" title={r.key}>
                {r.display ?? r.key}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-[#3c639f]">
                {r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

// X / Y reach card (e.g. "Anasayfaya gelen 100 kişiden 25'i partner badge'e
// tıkladı"). Big numerator/denominator with a small percentage line.
function ReachCard({
  icon,
  title,
  sub,
  reach,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  reach: Reach
}) {
  const pct =
    reach.reached === 0 ? 0 : Math.round((reach.acted / reach.reached) * 100)
  return (
    <CardShell icon={icon} title={title} sub={sub}>
      {reach.reached === 0 ? (
        <p className="text-[12.5px] text-black/40">
          Bu aralıkta sayfaya gelen yok.
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-[#0a0a0a]">
              {reach.acted}
            </span>
            <span className="text-[13px] text-black/45">
              / {reach.reached} kişi
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
              <div
                className="h-full rounded-full bg-[#3c639f] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-black/55">
              %{pct}
            </span>
          </div>
        </>
      )}
    </CardShell>
  )
}

// "kaç kişi geldi / toplam ne kadar durdu / ortalama" — section dwell.
function DwellCard({
  icon,
  title,
  visitorsOnPage,
  dwell,
}: {
  icon: React.ReactNode
  title: string
  visitorsOnPage: number
  dwell: { visitors: number; totalMs: number; avgMs: number }
}) {
  return (
    <CardShell
      icon={icon}
      title={title}
      sub={
        visitorsOnPage > 0
          ? `Anasayfaya gelen ${visitorsOnPage} kişiden ${dwell.visitors}'i bu bölüme ulaştı`
          : "Bu aralıkta sayfaya gelen yok."
      }
    >
      {dwell.visitors === 0 ? (
        <p className="text-[12.5px] text-black/40">
          Bu bölümde durma kaydı yok.
        </p>
      ) : (
        <dl className="flex flex-col gap-2">
          <DwellRow label="Bölüme ulaşan" value={`${dwell.visitors} kişi`} />
          <DwellRow label="Toplam durma" value={formatDuration(dwell.totalMs)} />
          <DwellRow
            label="Ortalama durma"
            value={formatDuration(dwell.avgMs)}
          />
        </dl>
      )}
    </CardShell>
  )
}

function DwellRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
      <dt className="text-black/55">{label}</dt>
      <dd className="shrink-0 tabular-nums font-medium text-[#0a0a0a]">
        {value}
      </dd>
    </div>
  )
}

function VisitorDurationCard({
  buckets,
}: {
  buckets: {
    total: number
    under30s: number
    over1m: number
    over3m: number
    over5m: number
  }
}) {
  return (
    <CardShell
      icon={<Users size={14} className="text-[#3c639f]" />}
      title="Toplam ziyaretçi sayısı"
    >
      {buckets.total === 0 ? (
        <p className="text-[12.5px] text-black/40">Bu aralıkta ziyaretçi yok.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-[#0a0a0a]">
              {buckets.total}
            </span>
            <span className="text-[13px] text-black/45">kişi</span>
          </div>
          <dl className="mt-3 flex flex-col gap-1.5">
            <DurationRow
              label="30sn'den az kalanlar"
              value={buckets.under30s}
              total={buckets.total}
            />
            <DurationRow
              label="1-3 dk arası kalanlar"
              value={buckets.over1m}
              total={buckets.total}
            />
            <DurationRow
              label="3-5 dk arası kalanlar"
              value={buckets.over3m}
              total={buckets.total}
            />
            <DurationRow
              label="5dk'dan fazla kalanlar"
              value={buckets.over5m}
              total={buckets.total}
            />
          </dl>
        </>
      )}
    </CardShell>
  )
}

function DurationRow({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
      <dt className="text-black/65">{label}</dt>
      <dd className="shrink-0 tabular-nums text-[#3c639f]">
        <span className="font-semibold">{value}</span>
        <span className="ml-1 text-black/40">· %{pct}</span>
      </dd>
    </div>
  )
}

function DeviceCard({
  counts,
  total,
  scopeLabel,
}: {
  counts: Record<Device, number>
  total: number
  scopeLabel: string
}) {
  return (
    <CardShell
      icon={<PieChart size={14} className="text-[#3c639f]" />}
      title="En çok giriş yapılan cihazlar"
      sub={scopeLabel}
    >
      {total === 0 ? (
        <p className="text-[12.5px] text-black/40">Bu aralıkta veri yok.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <DeviceBar
            label="Masaüstü"
            count={counts["Masaüstü"]}
            total={total}
            color="emerald"
            icon={<MonitorSmartphone size={12} />}
          />
          <DeviceBar
            label="Mobil"
            count={counts["Mobil"]}
            total={total}
            color="amber"
            icon={<Smartphone size={12} />}
          />
          <DeviceBar
            label="Tablet"
            count={counts["Tablet"]}
            total={total}
            color="violet"
            icon={<Tablet size={12} />}
          />
          {counts["?"] > 0 && (
            <DeviceBar
              label="Bilinmeyen"
              count={counts["?"]}
              total={total}
              color="black"
              icon={<Globe2 size={12} />}
            />
          )}
        </div>
      )}
    </CardShell>
  )
}

function BlogStats({
  stats,
  scopeLabel,
}: {
  stats: { slug: string; title: string; views: number }[]
  scopeLabel: string
}) {
  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-[13px] text-black/45">
        Henüz yayınlanmış blog yazısı yok.
      </div>
    )
  }
  const top5 = stats.slice(0, 5).filter((s) => s.views > 0)
  const totalViews = stats.reduce((sum, s) => sum + s.views, 0)
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <CardShell
        icon={<BookOpen size={14} className="text-[#3c639f]" />}
        title="En çok görüntülenen ilk 5 blog"
        sub={scopeLabel}
      >
        {top5.length === 0 ? (
          <p className="text-[12.5px] text-black/40">
            Bu aralıkta blog görüntülenmesi yok.
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {top5.map((s, idx) => (
              <li
                key={s.slug}
                className="flex items-baseline gap-3 text-[12.5px]"
              >
                <span className="shrink-0 tabular-nums font-semibold text-[#3c639f]/70">
                  {idx + 1}.
                </span>
                <Link
                  href={`/blog/${s.slug}`}
                  target="_blank"
                  className="min-w-0 flex-1 truncate text-black/80 hover:text-[#3c639f] hover:underline"
                  title={s.title}
                >
                  {s.title}
                </Link>
                <span className="shrink-0 inline-flex items-baseline gap-1 tabular-nums font-medium text-[#0a0a0a]">
                  {s.views}
                  <span className="text-[10.5px] font-normal text-black/40">
                    görüntülenme
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardShell>

      <CardShell
        icon={<Eye size={14} className="text-[#3c639f]" />}
        title="Tüm blogların görüntülenme listesi"
        sub={`${stats.length} yazı · toplam ${totalViews} görüntülenme`}
      >
        <ul className="flex flex-col gap-1.5">
          {stats.map((s) => (
            <li
              key={s.slug}
              className="flex items-baseline justify-between gap-3 border-b border-black/[0.04] pb-1.5 text-[12.5px] last:border-b-0"
            >
              <Link
                href={`/blog/${s.slug}`}
                target="_blank"
                className="min-w-0 flex-1 truncate text-black/75 hover:text-[#3c639f] hover:underline"
                title={s.title}
              >
                {s.title}
              </Link>
              <span className="shrink-0 tabular-nums font-medium text-[#3c639f]">
                {s.views}
              </span>
            </li>
          ))}
        </ul>
      </CardShell>
    </div>
  )
}

function DeviceBar({
  label,
  count,
  total,
  color,
  icon,
}: {
  label: string
  count: number
  total: number
  color: "emerald" | "amber" | "violet" | "black"
  icon: React.ReactNode
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  const fill = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    black: "bg-black/40",
  }[color]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-black/70">
          <span className="text-black/45">{icon}</span>
          {label}
        </span>
        <span className="tabular-nums text-black/55">
          {count} <span className="text-black/35">· %{pct}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className={`h-full rounded-full ${fill} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Visitor row ──────────────────────────────────────────────────────

function VisitorRow({
  visitor,
  isSelf,
  ownIp: _ownIp,
}: {
  visitor: Visitor
  isSelf: boolean
  ownIp: string
}) {
  void _ownIp
  const events = visitor.events.slice(0, 80)
  const browser = browserName(visitor.userAgent)
  const os = osName(visitor.userAgent)
  const device = deviceType(visitor.userAgent)
  const tags = visitorTags(visitor)

  return (
    <li>
      <details
        className={`group rounded-xl border bg-white transition-colors ${
          isSelf
            ? "border-[#3c639f]/35 bg-[#3c639f]/[0.04]"
            : "border-black/[0.08]"
        }`}
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
              isSelf
                ? "bg-[#3c639f] text-white"
                : "bg-black/[0.05] text-black/60"
            }`}
            title={`${browser} / ${os} / ${device}`}
          >
            {isSelf ? "SEN" : visitor.ip.split(".").pop()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-mono font-medium text-[#0a0a0a]">
                {visitor.ip || "?"}
              </span>
              {isSelf && (
                <span className="rounded-full bg-[#3c639f] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                  Sen
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                  device === "Mobil"
                    ? "bg-amber-100 text-amber-800"
                    : device === "Tablet"
                      ? "bg-violet-100 text-violet-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}
              >
                <DeviceIcon device={device} />
                {device}
              </span>
            </div>
            <div className="mt-0.5 text-[11.5px] text-black/50">
              {visitor.events.length} olay · son {relTime(visitor.lastSeen)} ·{" "}
              {browser} · {os}
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t.label}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${TAG_COLOR[t.color]}`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="text-[11.5px] text-black/40 group-open:hidden">
            Aç ↓
          </span>
          <span className="hidden text-[11.5px] text-black/40 group-open:inline">
            Kapat ↑
          </span>
        </summary>

        <div className="border-t border-black/[0.06] px-4 pb-4 pt-3">
          <ul className="flex flex-col">
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
            {visitor.events.length > 80 && (
              <li className="mt-2 text-[11.5px] text-black/40">
                + {visitor.events.length - 80} daha eski olay (gösterilmiyor)
              </li>
            )}
          </ul>
        </div>
      </details>
    </li>
  )
}

function EventRow({ event }: { event: StoredEvent }) {
  return (
    <li className="flex items-start gap-3 border-b border-black/[0.04] py-2 last:border-b-0">
      <span className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#3c639f]/60" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] text-[#0a0a0a]">
          <span className="font-medium">{EVENT_LABEL[event.type]}</span>
          <EventDetail event={event} />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-black/40">
          <span title={event.ts}>{relTime(event.ts)}</span>
          <span>·</span>
          <span className="truncate font-mono">{event.path}</span>
          <span className="hidden md:inline">
            · {TR_DATE_TIME.format(new Date(event.ts))}
          </span>
        </div>
      </div>
    </li>
  )
}

function EventDetail({ event }: { event: StoredEvent }) {
  const d = event.data ?? {}
  switch (event.type) {
    case "page_view":
      return (
        <span className="text-black/60">
          {d.referrer ? `← ${String(d.referrer)}` : "doğrudan"}
        </span>
      )
    case "section_view":
      return (
        <span className="text-black/60">
          {sectionLabel(String(d.section ?? "?"))}
        </span>
      )
    case "section_dwell": {
      const ms = Number(d.durationMs ?? 0)
      return (
        <span className="text-black/60">
          {sectionLabel(String(d.section ?? "?"))}{" "}
          <span className="text-[#3c639f]">({(ms / 1000).toFixed(1)}s)</span>
        </span>
      )
    }
    case "click":
      return (
        <span className="text-black/60">
          <span className="font-mono text-[11.5px]">
            {String(d.target ?? "?")}
          </span>
          {d.label ? (
            <span className="ml-1 text-black/45">— {String(d.label)}</span>
          ) : null}
        </span>
      )
    case "tab_change":
      return (
        <span className="text-black/60">
          {String(d.control ?? "?")}:{" "}
          <strong>{String(d.value ?? "?")}</strong>
          {d.label ? (
            <span className="ml-1 text-black/45">— {String(d.label)}</span>
          ) : null}
        </span>
      )
    default:
      return null
  }
}

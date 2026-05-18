import Link from "next/link"
import { headers } from "next/headers"
import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Eye,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  PieChart,
  Smartphone,
  Tablet,
  Trash2,
  Users,
} from "lucide-react"
import {
  dailySeriesForMonth,
  dayBuckets,
  dayKey,
  hourlySeries,
  listVisitorsFrom,
  monthBuckets,
  monthKey,
  readEvents,
  topClicksFrom,
  topPagesFrom,
  topSectionsFrom,
  type Tally,
  type Visitor,
} from "@/lib/analytics-store"
import { readAnalyticsSettings } from "@/lib/analytics-settings"
import {
  EVENT_LABEL,
  sectionLabel,
  type StoredEvent,
} from "@/lib/analytics-types"
import {
  clearAnalyticsAction,
  clearDayAction,
  clearMonthAction,
  setEnabledAction,
} from "./actions"
import { ConfirmForm } from "./confirm-form"

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

// ── Activity tags ─────────────────────────────────────────────────────
// Look at a visitor's click events and extract human-readable badges so
// the admin can see at a glance "this person submitted an appointment"
// without expanding the timeline.

type Tag = { label: string; color: "emerald" | "green" | "blue" | "violet" | "rose" | "amber" | "indigo" }

const TAG_RULES: Array<{ match: (target: string) => boolean; tag: Tag }> = [
  {
    match: (t) => t === "randevu-olustur",
    tag: { label: "Randevu oluşturdu", color: "emerald" },
  },
  {
    match: (t) => t.startsWith("whatsapp:"),
    tag: { label: "WhatsApp'a tıkladı", color: "green" },
  },
  {
    match: (t) => t.startsWith("talep-edin:"),
    tag: { label: "Talep popup'ı açtı", color: "blue" },
  },
  {
    match: (t) => t.startsWith("detaylari-gor:"),
    tag: { label: "Paket detayına baktı", color: "violet" },
  },
  {
    match: (t) => t === "header:blog-cta",
    tag: { label: "Header Blog'a bastı", color: "rose" },
  },
  {
    match: (t) => t.startsWith("blog:card:"),
    tag: { label: "Blog yazısı açtı", color: "amber" },
  },
  {
    match: (t) => t === "home:service-card:web-site",
    tag: { label: "Web Site kartı", color: "indigo" },
  },
  {
    match: (t) => t === "home:service-card:dijital-reklamlar",
    tag: { label: "Dijital Reklamlar kartı", color: "indigo" },
  },
]

function visitorTags(visitor: Visitor): Tag[] {
  const seen = new Set<string>()
  const out: Tag[] = []
  for (const e of visitor.events) {
    if (e.type !== "click") continue
    const target = String(e.data?.target ?? "")
    for (const rule of TAG_RULES) {
      if (rule.match(target) && !seen.has(rule.tag.label)) {
        seen.add(rule.tag.label)
        out.push(rule.tag)
      }
    }
  }
  return out.slice(0, 6)
}

const TAG_COLOR: Record<Tag["color"], string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  violet: "bg-violet-100 text-violet-800",
  rose: "bg-rose-100 text-rose-800",
  amber: "bg-amber-100 text-amber-800",
  indigo: "bg-indigo-100 text-indigo-800",
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; month?: string }>
}) {
  const params = await searchParams
  const rawDay = params.day?.trim() ?? ""
  const rawMonth = params.month?.trim() ?? ""

  const [allEvents, ownIp, settings] = await Promise.all([
    readEvents(),
    getOwnIp(),
    readAnalyticsSettings(),
  ])
  const buckets = dayBuckets(allEvents)
  const months = monthBuckets(allEvents)
  const todayKey = dayKey(new Date().toISOString())

  // Resolve filter: explicit day wins; otherwise explicit month; otherwise all.
  const validDay =
    rawDay && /^\d{4}-\d{2}-\d{2}$/.test(rawDay) ? rawDay : null
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

  // The chart always shows a month. Fall back to the most recent month
  // with data when nothing is selected (so admin always sees something).
  const chartMonth =
    validMonth ??
    months[0]?.month ??
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

  const visitors = listVisitorsFrom(scopeEvents)
  const pagesT = topPagesFrom(scopeEvents, 10)
  const clicksT = topClicksFrom(scopeEvents, 10)
  const sectionsT = topSectionsFrom(scopeEvents, 10).map((row) => ({
    ...row,
    key: sectionLabel(row.key),
  }))

  const dailySeries = dailySeriesForMonth(allEvents, chartMonth)
  const hourlyData = hourlySeries(scopeEvents)

  const totalEvents = scopeEvents.length
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

  // Days of the current chart month (for the day chip strip).
  const daysForChartMonth = buckets.filter((b) =>
    b.day.startsWith(chartMonth),
  )

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Analitik
          </h1>
          <p className="text-[13.5px] text-black/55">
            Site ziyaretçilerinin sayfa, bölüm, buton ve sekme hareketleri.
            Ay/gün seçimine göre filtreleyebilir, grafiklerden zaman içindeki
            dağılımı görebilirsin.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 rounded-full border border-black/[0.10] bg-white p-1">
            <ToggleButton enabled={settings.enabled} value="true">
              Aktif
            </ToggleButton>
            <ToggleButton enabled={!settings.enabled} value="false">
              Pasif
            </ToggleButton>
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

      {/* Filter controls — three rows: month picker (chips + input),
          day picker (chips + input). All wired through URL params so
          they're back-button friendly. */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.08em] text-black/45">
          <CalendarDays size={12} />
          Filtrele
        </div>

        {/* Months */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-black/45">
            <span>Ay</span>
            <form
              action="/admin/analitik"
              method="GET"
              className="flex items-center gap-2"
            >
              <input
                type="month"
                name="month"
                defaultValue={validMonth ?? ""}
                className="rounded-md border border-black/[0.10] bg-white px-2 py-1 text-[11.5px] text-[#0a0a0a]"
              />
              <button
                type="submit"
                className="rounded-md border border-black/[0.10] bg-white px-2.5 py-1 text-[11.5px] font-medium text-black/65 hover:bg-black/[0.03]"
              >
                Aya git
              </button>
            </form>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            <Chip
              href="/admin/analitik"
              active={!validMonth && !validDay}
              label="Tüm zamanlar"
              sub={`${allEvents.length.toLocaleString("tr-TR")} olay`}
            />
            {months.map((m) => (
              <Chip
                key={m.month}
                href={`/admin/analitik?month=${m.month}`}
                active={!validDay && m.month === validMonth}
                label={formatMonthLabel(m.month)}
                sub={`${m.visitors} kişi · ${m.events} olay`}
              />
            ))}
          </div>
        </div>

        {/* Days within selected month */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-black/45">
            <span>
              {validMonth
                ? `Gün — ${formatMonthLabel(chartMonth)}`
                : "Gün (son etkin günler)"}
            </span>
            <form
              action="/admin/analitik"
              method="GET"
              className="flex items-center gap-2"
            >
              <input
                type="date"
                name="day"
                defaultValue={validDay ?? ""}
                className="rounded-md border border-black/[0.10] bg-white px-2 py-1 text-[11.5px] text-[#0a0a0a]"
              />
              <button
                type="submit"
                className="rounded-md border border-black/[0.10] bg-white px-2.5 py-1 text-[11.5px] font-medium text-black/65 hover:bg-black/[0.03]"
              >
                Güne git
              </button>
            </form>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {(validMonth ? daysForChartMonth : buckets).length === 0 ? (
              <span className="text-[12px] text-black/40">
                Bu ayda olay yok.
              </span>
            ) : (
              (validMonth ? daysForChartMonth : buckets).map((b) => (
                <Chip
                  key={b.day}
                  href={`/admin/analitik?day=${b.day}`}
                  active={b.day === validDay}
                  label={formatDayLabel(b.day, todayKey)}
                  sub={`${b.visitors} kişi · ${b.events} olay`}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top banner stat boxes */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatBox
          icon={<Eye size={15} />}
          label={`Senin IP'in · ${scopeLabel}`}
          value={ownIp}
          sub={
            own
              ? `${own.events.length} olay · son ${relTime(own.lastSeen)}`
              : "bu aralıkta aktivite yok"
          }
          accent
        />
        <StatBox
          icon={<Users size={15} />}
          label={`Ziyaretçi · ${scopeLabel}`}
          value={String(visitors.length)}
          sub={`${others.length} farklı IP (sen hariç)`}
        />
        <StatBox
          icon={<Activity size={15} />}
          label={`Toplam olay · ${scopeLabel}`}
          value={totalEvents.toLocaleString("tr-TR")}
          sub={`tüm zamanlar: ${allEvents.length.toLocaleString("tr-TR")}`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          icon={<BarChart3 size={14} className="text-[#3c639f]" />}
          title={`${formatMonthLabel(chartMonth)} — gün gün`}
          headerExtra={
            validMonth ? (
              <ConfirmForm
                action={clearMonthAction}
                message={`${formatMonthLabel(chartMonth)} ayına ait tüm olaylar silinecek. Emin misin?`}
                className="ml-2"
              >
                <input type="hidden" name="month" value={chartMonth} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2 py-0.5 text-[10.5px] font-medium text-black/55 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={10} />
                  Bu ayı sıfırla
                </button>
              </ConfirmForm>
            ) : null
          }
          className="lg:col-span-2"
        >
          <DailyBarChart series={dailySeries} todayKey={todayKey} />
        </ChartCard>

        <ChartCard
          icon={<Clock size={14} className="text-[#3c639f]" />}
          title="Saatlik dağılım"
        >
          <HourlyBarChart series={hourlyData} />
        </ChartCard>
      </div>

      {/* Device breakdown */}
      <ChartCard
        icon={<PieChart size={14} className="text-[#3c639f]" />}
        title={`Cihaz dağılımı · ${scopeLabel}`}
      >
        {deviceTotal === 0 ? (
          <p className="text-[12.5px] text-black/45">Bu aralıkta veri yok.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            <DeviceBar
              label="Masaüstü"
              count={deviceCounts["Masaüstü"]}
              total={deviceTotal}
              color="emerald"
              icon={<MonitorSmartphone size={12} />}
            />
            <DeviceBar
              label="Mobil"
              count={deviceCounts["Mobil"]}
              total={deviceTotal}
              color="amber"
              icon={<Smartphone size={12} />}
            />
            <DeviceBar
              label="Tablet"
              count={deviceCounts["Tablet"]}
              total={deviceTotal}
              color="violet"
              icon={<Tablet size={12} />}
            />
            {deviceCounts["?"] > 0 && (
              <DeviceBar
                label="Bilinmeyen"
                count={deviceCounts["?"]}
                total={deviceTotal}
                color="black"
                icon={<Globe2 size={12} />}
              />
            )}
          </div>
        )}
      </ChartCard>

      {/* Stat tables */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatTable
          icon={<Eye size={14} className="text-[#3c639f]" />}
          title="En çok ziyaret edilen sayfalar"
          rows={pagesT}
        />
        <StatTable
          icon={<MousePointerClick size={14} className="text-[#3c639f]" />}
          title="En çok tıklanan / değiştirilen"
          rows={clicksT}
        />
        <StatTable
          icon={<Clock size={14} className="text-[#3c639f]" />}
          title="En çok durulan bölümler"
          rows={sectionsT}
        />
      </div>

      {/* Visitors */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-[#3c639f]" />
            <div className="text-[13px] font-semibold text-[#0a0a0a]">
              Ziyaretçiler ({scopeLabel})
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {validDay && (
              <ConfirmForm
                action={clearDayAction}
                message={`${formatDayLabel(validDay, todayKey)} (${validDay}) günündeki tüm olaylar silinecek. Emin misin?`}
              >
                <input type="hidden" name="day" value={validDay} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium text-black/60 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={12} />
                  Bu günü sıfırla
                </button>
              </ConfirmForm>
            )}
            <ConfirmForm
              action={clearAnalyticsAction}
              message="Tüm zamanlardaki analitik olayları geri dönüşsüz silinecek. Emin misin?"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.10] bg-white px-3 py-1.5 text-[12px] font-medium text-black/60 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={12} />
                Tümünü sıfırla
              </button>
            </ConfirmForm>
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
              <VisitorRow
                key={v.ip}
                visitor={v}
                isSelf={false}
                ownIp={ownIp}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

// ── UI bits ──────────────────────────────────────────────────────────

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

function Chip({
  href,
  active,
  label,
  sub,
}: {
  href: string
  active: boolean
  label: string
  sub: string
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-lg border px-3.5 py-2 text-left transition-colors ${
        active
          ? "border-[#3c639f] bg-[#3c639f] text-white shadow-[0_4px_12px_-4px_rgba(60,99,159,0.40)]"
          : "border-black/[0.10] bg-white text-black/70 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
      }`}
    >
      <div className="text-[12px] font-semibold leading-tight">{label}</div>
      <div
        className={`mt-0.5 text-[10.5px] leading-tight ${
          active ? "text-white/75" : "text-black/45"
        }`}
      >
        {sub}
      </div>
    </Link>
  )
}

function StatBox({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-[#3c639f]/30 bg-[#3c639f]/[0.04]"
          : "border-black/[0.06] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[18px] font-semibold tabular-nums tracking-[-0.01em] text-[#0a0a0a]">
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-black/55">{sub}</div>
    </div>
  )
}

function ChartCard({
  icon,
  title,
  headerExtra,
  className,
  children,
}: {
  icon: React.ReactNode
  title: string
  headerExtra?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.06] bg-white p-5 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-[12.5px] font-semibold text-[#0a0a0a]">
            {title}
          </div>
        </div>
        {headerExtra}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

// ── Charts ────────────────────────────────────────────────────────────

function DailyBarChart({
  series,
  todayKey,
}: {
  series: { day: string; events: number; visitors: number }[]
  todayKey: string
}) {
  const max = Math.max(...series.map((d) => d.events), 1)
  const totalEvents = series.reduce((n, d) => n + d.events, 0)
  if (series.length === 0)
    return <p className="text-[12.5px] text-black/45">Veri yok.</p>

  const barWidth = 18
  const gap = 4
  const chartHeight = 130
  const labelHeight = 22
  const chartWidth = series.length * (barWidth + gap) - gap
  const svgHeight = chartHeight + labelHeight

  return (
    <div>
      <div className="text-[11.5px] text-black/50">
        {totalEvents.toLocaleString("tr-TR")} toplam olay · maks{" "}
        {max.toLocaleString("tr-TR")} / gün
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="mt-3 h-[170px] w-full"
        role="img"
      >
        {/* Baseline */}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={0.5}
        />
        {series.map((d, i) => {
          const x = i * (barWidth + gap)
          const h = d.events === 0 ? 1 : (d.events / max) * chartHeight
          const y = chartHeight - h
          const dayNum = parseInt(d.day.slice(-2), 10)
          const isToday = d.day === todayKey
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={2}
                fill={
                  d.events === 0
                    ? "rgba(0,0,0,0.08)"
                    : isToday
                      ? "#5b8de6"
                      : "#3c639f"
                }
                opacity={d.events === 0 ? 0.6 : 1}
              >
                <title>
                  {d.day} — {d.events} olay, {d.visitors} kişi
                </title>
              </rect>
              {(dayNum === 1 ||
                dayNum % 5 === 0 ||
                i === series.length - 1) && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(0,0,0,0.45)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {dayNum}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="mt-2 text-[10.5px] text-black/40">
        Bar üzerine fareyle gel → o günün detayı (olay/kişi). Bugün varsa daha
        açık tonda.
      </div>
    </div>
  )
}

function HourlyBarChart({
  series,
}: {
  series: { hour: number; events: number }[]
}) {
  const max = Math.max(...series.map((d) => d.events), 1)
  const total = series.reduce((n, d) => n + d.events, 0)
  if (total === 0)
    return <p className="text-[12.5px] text-black/45">Veri yok.</p>

  const barWidth = 12
  const gap = 3
  const chartHeight = 110
  const labelHeight = 22
  const chartWidth = series.length * (barWidth + gap) - gap

  return (
    <div>
      <div className="text-[11.5px] text-black/50">
        {total.toLocaleString("tr-TR")} olay · maks {max} / saat
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + labelHeight}`}
        preserveAspectRatio="none"
        className="mt-3 h-[150px] w-full"
        role="img"
      >
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={0.5}
        />
        {series.map((d, i) => {
          const x = i * (barWidth + gap)
          const h = d.events === 0 ? 1 : (d.events / max) * chartHeight
          const y = chartHeight - h
          return (
            <g key={d.hour}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={2}
                fill={d.events === 0 ? "rgba(0,0,0,0.08)" : "#3c639f"}
              >
                <title>
                  {String(d.hour).padStart(2, "0")}:00 — {d.events} olay
                </title>
              </rect>
              {d.hour % 3 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="rgba(0,0,0,0.45)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {String(d.hour).padStart(2, "0")}
                </text>
              )}
            </g>
          )
        })}
      </svg>
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

function StatTable({
  icon,
  title,
  rows,
}: {
  icon: React.ReactNode
  title: string
  rows: Tally[]
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-[12.5px] font-semibold text-[#0a0a0a]">
          {title}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-[12px] text-black/40">Henüz veri yok.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-baseline justify-between gap-2 text-[12.5px]"
            >
              <span className="min-w-0 truncate text-black/75" title={r.key}>
                {r.key}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-[#3c639f]">
                {r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
      {rows.some((r) => r.meta) && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-black/[0.06] pt-2">
          {rows
            .filter((r) => r.meta)
            .map((r) => (
              <li key={r.key + "-meta"} className="text-[10.5px] text-black/45">
                <span className="font-medium text-black/60">{r.key}</span>:{" "}
                {r.meta}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

// ── Visitor row ──────────────────────────────────────────────────────

function VisitorRow({
  visitor,
  isSelf,
  ownIp,
}: {
  visitor: Visitor
  isSelf: boolean
  ownIp: string
}) {
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

import Link from "next/link"
import { cookies } from "next/headers"
import {
  Activity,
  Briefcase,
  Calendar,
  ExternalLink,
  History,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react"
import { SESSION_COOKIE, verifySession } from "@/lib/admin-session"
import {
  dayKey,
  listVisitorsFrom,
  readEvents,
} from "@/lib/analytics-store"
import { readAppointments } from "@/lib/appointments-store"
import { readAuditLog } from "@/lib/audit-log-store"
import { readBlog } from "@/lib/blog-store"
import { readInquiries } from "@/lib/inquiries-store"
import { readQuotes } from "@/lib/quotes-store"
import { isPostLive } from "@/lib/blog-types"
import { readHero } from "@/lib/hero-store"
import { HeroForm } from "./hero-form"

export const dynamic = "force-dynamic"

const DAY_FMT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function fmt(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DAY_FMT.format(d)
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export default async function AdminDashboardPage() {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)

  const [hero, events, inquiries, quotes, appointments, blog, audit] =
    await Promise.all([
      readHero(),
      readEvents(),
      readInquiries(),
      readQuotes(),
      readAppointments(),
      readBlog(),
      readAuditLog(),
    ])

  const now = new Date()
  const today = dayKey(now.toISOString())
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000)

  const visitorsToday = new Set(
    events.filter((e) => dayKey(e.ts) === today).map((e) => e.ip),
  ).size
  const visitorsWeek = listVisitorsFrom(
    events.filter((e) => new Date(e.ts) > weekAgo),
  ).length

  const newTalepWeek =
    inquiries.inquiries.filter((i) => new Date(i.createdAt) > weekAgo).length +
    quotes.quotes.filter((q) => new Date(q.createdAt) > weekAgo).length +
    appointments.appointments.filter((a) => new Date(a.createdAt) > weekAgo).length

  const livePostCount = blog.posts.filter((p) => isPostLive(p, now)).length
  const draftCount = blog.posts.length - livePostCount

  const lastLogin = audit
    .filter((e) => e.action === "auth.login.ok" && e.user === session?.username)
    .slice(1, 2)[0] // first entry is the current session — show the previous one

  const recentTalepler = [
    ...inquiries.inquiries.map((i) => ({
      kind: "İletişim",
      who: i.name || i.email,
      ts: i.createdAt,
      href: "/admin/talepler",
    })),
    ...quotes.quotes.map((q) => ({
      kind: "Teklif",
      who: q.name || q.email,
      ts: q.createdAt,
      href: "/admin/talepler?tab=teklif",
    })),
    ...appointments.appointments.map((a) => ({
      kind: "Randevu",
      who: a.name || a.phone,
      ts: a.createdAt,
      href: "/admin/talepler?tab=randevu",
    })),
  ]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 5)

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-7">
      <header className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Anasayfa
          </h1>
          <p className="mt-1 text-[13.5px] text-black/55">
            Site genel durumu. Son giriş:{" "}
            <span className="font-medium text-[#0a0a0a]">
              {lastLogin ? fmt(lastLogin.ts) : "—"}
            </span>
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.10] bg-white px-3 py-1.5 text-[11.5px] font-medium text-black/65 transition-colors hover:border-[#3c639f]/30 hover:text-[#3c639f]"
        >
          <ExternalLink size={11} />
          Siteyi aç
        </a>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          icon={<Users size={14} className="text-[#3c639f]" />}
          label="Bugünkü ziyaretçi"
          value={visitorsToday}
          sub={`${visitorsWeek} kişi son 7 gün`}
          href="/admin/analitik"
        />
        <Stat
          icon={<Briefcase size={14} className="text-[#3c639f]" />}
          label="Yeni talep (7g)"
          value={newTalepWeek}
          sub={`${inquiries.inquiries.length + quotes.quotes.length + appointments.appointments.length} toplam kayıt`}
          href="/admin/talepler"
        />
        <Stat
          icon={<MessageSquare size={14} className="text-[#3c639f]" />}
          label="Blog yazıları"
          value={livePostCount}
          sub={`${draftCount} taslak/zamanlanmış`}
          href="/admin/blog"
        />
        <Stat
          icon={<Activity size={14} className="text-[#3c639f]" />}
          label="Toplam olay"
          value={events.length}
          sub="analytics-store"
          href="/admin/analitik"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[#3c639f]" />
              <div className="text-[13px] font-semibold text-[#0a0a0a]">
                Son talepler
              </div>
            </div>
            <Link
              href="/admin/talepler"
              className="text-[11.5px] font-medium text-[#3c639f] hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          {recentTalepler.length === 0 ? (
            <p className="mt-4 text-[12.5px] text-black/45">
              Henüz talep yok.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-black/[0.04]">
              {recentTalepler.map((t, idx) => (
                <li key={idx}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between gap-3 py-2 transition-colors hover:bg-black/[0.02]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-full bg-[#3c639f]/[0.10] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#3c639f]">
                        {t.kind}
                      </span>
                      <span className="truncate text-[12.5px] text-[#0a0a0a]">
                        {t.who}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-black/45">
                      {fmt(t.ts)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={15} className="text-[#3c639f]" />
              <div className="text-[13px] font-semibold text-[#0a0a0a]">
                Son işlemler
              </div>
            </div>
            <Link
              href="/admin/ayarlar"
              className="text-[11.5px] font-medium text-[#3c639f] hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          {audit.length === 0 ? (
            <p className="mt-4 text-[12.5px] text-black/45">
              Henüz işlem yok.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-black/[0.04]">
              {audit.slice(0, 5).map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] text-[#0a0a0a]">
                      {e.action}
                    </div>
                    <div className="text-[11px] text-black/45">
                      {e.user}
                      {e.target ? ` · ${e.target}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-black/45">
                    {fmt(e.ts)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Anasayfa hero
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Anasayfanın üstündeki başlık altı yazısı ve CTA butonları.
        </p>
        <div className="mt-4">
          <HeroForm initial={hero} />
        </div>
      </section>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1.5 rounded-2xl border border-black/[0.06] bg-white p-4 transition-colors hover:border-[#3c639f]/30"
    >
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-black/45">
        {icon}
        {label}
      </div>
      <div className="text-[24px] font-semibold tabular-nums tracking-[-0.02em] text-[#0a0a0a]">
        {value}
      </div>
      <div className="text-[11px] text-black/45">{sub}</div>
    </Link>
  )
}

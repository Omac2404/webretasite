import Link from "next/link"
import {
  Briefcase,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react"
import { readAppointments } from "@/lib/appointments-store"
import { readInquiries } from "@/lib/inquiries-store"
import { readQuotes } from "@/lib/quotes-store"
import { SeenMarker } from "./seen-marker"
import type { Appointment } from "@/lib/appointments-types"
import type { Inquiry } from "@/lib/inquiries-types"
import type { Quote } from "@/lib/quotes-types"
import {
  deleteAppointmentAction,
  deleteInquiryAction,
  deleteQuoteAction,
  retryAppointmentMailAction,
  retryInquiryMailAction,
  retryQuoteMailAction,
} from "./actions"

export const dynamic = "force-dynamic"

type Tab = "iletisim" | "teklif" | "randevu"

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: "iletisim", label: "İletişim mesajları", sub: "İletişim sayfası formu" },
  { id: "teklif", label: "Teklif istekleri", sub: "Web Site teklif sihirbazı" },
  { id: "randevu", label: "Randevu talepleri", sub: "Dijital Reklamlar paket formu" },
]

const DATE_FMT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const DAY_FMT = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function fmtDateTime(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d)
}

function fmtDay(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DAY_FMT.format(d)
}

export default async function TekliflerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const requested = params.tab ?? ""
  const activeTab: Tab =
    TABS.find((t) => t.id === requested)?.id ?? "iletisim"

  const [inquiries, quotes, appointments] = await Promise.all([
    readInquiries(),
    readQuotes(),
    readAppointments(),
  ])

  const counts: Record<Tab, number> = {
    iletisim: inquiries.inquiries.length,
    teklif: quotes.quotes.length,
    randevu: appointments.appointments.length,
  }

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <SeenMarker />
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Talepler
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Site formlarından düşen talepler. Mail bildirimi yine SMTP üzerinden
          gönderilir; bu sayfa kayıtların yedek dökümü ve takibi için.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => {
          const active = t.id === activeTab
          const href = t.id === "iletisim" ? "/admin/talepler" : `/admin/talepler?tab=${t.id}`
          return (
            <Link
              key={t.id}
              href={href}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                active
                  ? "border-[#3c639f] bg-[#3c639f] text-white"
                  : "border-black/[0.10] bg-white text-black/65 hover:border-[#3c639f]/30 hover:text-[#0a0a0a]"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 inline-flex items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold tabular-nums ${
                  active ? "bg-white/20 text-white" : "bg-black/[0.05] text-black/60"
                }`}
              >
                {counts[t.id]}
              </span>
            </Link>
          )
        })}
      </div>

      {activeTab === "iletisim" && (
        <InquiriesSection items={inquiries.inquiries} />
      )}
      {activeTab === "teklif" && <QuotesSection items={quotes.quotes} />}
      {activeTab === "randevu" && (
        <AppointmentsSection items={appointments.appointments} />
      )}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/[0.10] bg-white p-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
        {icon}
      </div>
      <p className="mt-3 text-[13px] text-black/50">{message}</p>
    </div>
  )
}

function CardHeader({
  title,
  subtitle,
  createdAt,
  deleteForm,
}: {
  title: string
  subtitle?: string
  createdAt: string
  deleteForm: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-semibold text-[#0a0a0a]">
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 truncate text-[11.5px] text-black/45">
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] text-black/40" title={createdAt}>
          {fmtDateTime(createdAt)}
        </span>
        {deleteForm}
      </div>
    </div>
  )
}

function DeleteButton({
  action,
  id,
}: {
  action: (formData: FormData) => Promise<void>
  id: string
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Sil"
        title="Sil"
        className="flex h-7 w-7 items-center justify-center rounded-md text-black/35 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={13} />
      </button>
    </form>
  )
}

function RetryButton({
  action,
  id,
}: {
  action: (formData: FormData) => Promise<void>
  id: string
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Mailleri tekrar gönder"
        title="Mailleri tekrar gönder"
        className="flex h-7 w-7 items-center justify-center rounded-md text-black/35 transition-colors hover:bg-[#3c639f]/[0.08] hover:text-[#3c639f]"
      >
        <RefreshCw size={12} />
      </button>
    </form>
  )
}

function DetailLine({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  if (!value) return null
  const inner = href ? (
    <a
      href={href}
      className="text-[#3c639f] underline-offset-2 hover:underline"
    >
      {value}
    </a>
  ) : (
    <span className="text-[#0a0a0a]">{value}</span>
  )
  return (
    <div className="flex items-center gap-2 text-[12.5px]">
      <span className="text-black/40">{icon}</span>
      <span className="text-black/50">{label}:</span>
      <span className="truncate">{inner}</span>
    </div>
  )
}

function InquiriesSection({ items }: { items: Inquiry[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={16} />}
        message="Henüz iletişim mesajı yok."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((i) => (
        <li
          key={i.id}
          className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-4"
        >
          <CardHeader
            title={i.name || "(isimsiz)"}
            subtitle={i.subject}
            createdAt={i.createdAt}
            deleteForm={
              <>
                <RetryButton action={retryInquiryMailAction} id={i.id} />
                <DeleteButton action={deleteInquiryAction} id={i.id} />
              </>
            }
          />
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
            <DetailLine
              icon={<Mail size={12} />}
              label="E-posta"
              value={i.email}
              href={`mailto:${i.email}`}
            />
            <DetailLine
              icon={<Phone size={12} />}
              label="Telefon"
              value={i.phone}
              href={`tel:${i.phone}`}
            />
          </div>
          {i.message && (
            <p className="whitespace-pre-wrap rounded-lg bg-black/[0.02] p-3 text-[12.5px] leading-relaxed text-black/75">
              {i.message}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function QuotesSection({ items }: { items: Quote[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase size={16} />}
        message="Henüz teklif isteği yok. Web Site sayfasındaki sihirbazdan gelen kayıtlar burada listelenir."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((q) => (
        <li
          key={q.id}
          className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-4"
        >
          <CardHeader
            title={`${q.name}${q.company ? ` — ${q.company}` : ""}`}
            subtitle={
              [q.serviceLabel, q.projectType].filter(Boolean).join(" · ") ||
              undefined
            }
            createdAt={q.createdAt}
            deleteForm={
              <>
                <RetryButton action={retryQuoteMailAction} id={q.id} />
                <DeleteButton action={deleteQuoteAction} id={q.id} />
              </>
            }
          />
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
            <DetailLine
              icon={<Mail size={12} />}
              label="E-posta"
              value={q.email}
              href={`mailto:${q.email}`}
            />
            <DetailLine
              icon={<Phone size={12} />}
              label="Telefon"
              value={q.phone}
              href={`tel:${q.phone}`}
            />
            <DetailLine
              icon={<User size={12} />}
              label="Sektör"
              value={q.industry}
            />
            <DetailLine
              icon={<Calendar size={12} />}
              label="Aranma"
              value={[q.date && fmtDay(q.date), q.time].filter(Boolean).join(" · ")}
            />
          </div>
          {q.description && (
            <p className="whitespace-pre-wrap rounded-lg bg-black/[0.02] p-3 text-[12.5px] leading-relaxed text-black/75">
              {q.description}
            </p>
          )}
          {q.refs.filter(Boolean).length > 0 && (
            <div className="text-[12px] text-black/55">
              <span className="font-medium text-black/65">Örnek siteler: </span>
              {q.refs.filter(Boolean).join(", ")}
            </div>
          )}
          <MailBadges userSent={q.mailUserSent} adminSent={q.mailAdminSent} error={q.mailError} />
        </li>
      ))}
    </ul>
  )
}

function AppointmentsSection({ items }: { items: Appointment[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={16} />}
        message="Henüz randevu talebi yok."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-4"
        >
          <CardHeader
            title={a.name || "(isimsiz)"}
            subtitle={[a.channelLabel, a.pkgName].filter(Boolean).join(" · ") || undefined}
            createdAt={a.createdAt}
            deleteForm={
              <>
                <RetryButton action={retryAppointmentMailAction} id={a.id} />
                <DeleteButton action={deleteAppointmentAction} id={a.id} />
              </>
            }
          />
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
            <DetailLine
              icon={<Mail size={12} />}
              label="E-posta"
              value={a.email}
              href={`mailto:${a.email}`}
            />
            <DetailLine
              icon={<Phone size={12} />}
              label="Telefon"
              value={a.phone}
              href={`tel:${a.phone}`}
            />
            <DetailLine
              icon={<Calendar size={12} />}
              label="Tarih"
              value={`${fmtDay(a.date)} · ${String(a.hour).padStart(2, "0")}:00`}
            />
            {a.pkgPrice && (
              <DetailLine
                icon={<Briefcase size={12} />}
                label="Paket fiyatı"
                value={a.pkgPrice}
              />
            )}
          </div>
          <MailBadges userSent={a.mailUserSent} adminSent={a.mailAdminSent} error={a.mailError} />
        </li>
      ))}
    </ul>
  )
}

function MailBadges({
  userSent,
  adminSent,
  error,
}: {
  userSent: boolean
  adminSent: boolean
  error?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
      <span
        className={`rounded-full px-2 py-0.5 font-medium ${
          userSent
            ? "bg-emerald-50 text-emerald-700"
            : "bg-black/[0.04] text-black/45"
        }`}
      >
        Kullanıcı maili: {userSent ? "gönderildi" : "—"}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 font-medium ${
          adminSent
            ? "bg-emerald-50 text-emerald-700"
            : "bg-black/[0.04] text-black/45"
        }`}
      >
        Admin maili: {adminSent ? "gönderildi" : "—"}
      </span>
      {error && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700" title={error}>
          Mail hatası
        </span>
      )}
    </div>
  )
}

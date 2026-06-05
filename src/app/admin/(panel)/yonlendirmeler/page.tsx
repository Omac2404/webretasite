import {
  Plus,
  Trash2,
  Power,
  PowerOff,
  Pencil,
  ArrowRight,
  Upload,
  Signpost,
  Eye,
  X,
} from "lucide-react"
import { readRedirects, type Redirect } from "@/lib/redirects-store"
import { readNotFoundLog } from "@/lib/notfound-log-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { AddRedirectForm } from "./add-redirect-form"
import { BulkImportForm } from "./bulk-import-form"
import { MapNotFoundForm } from "./map-notfound-form"
import { EditRedirectForm } from "./edit-redirect-form"
import {
  clearNotFoundAction,
  deleteRedirectAction,
  dismissNotFoundAction,
  toggleRedirectAction,
} from "./actions"

export const dynamic = "force-dynamic"

export default async function RedirectsAdminPage() {
  const [{ redirects }, notFound] = await Promise.all([
    readRedirects(),
    readNotFoundLog(),
  ])
  const active = redirects.filter((r) => r.enabled).length

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Yönlendirmeler
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Eski (WordPress) adresleri yeni sayfalara 301 ile yönlendirin —
            Google&apos;daki linkler 404&apos;e düşmez. {redirects.length} kural,{" "}
            {active} aktif.
          </p>
        </div>
        <PreviewLink href="/" />
      </div>

      {/* Add new redirect */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni yönlendirme
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Kaynak eski adres, hedef ise yeni adrestir. Tam eşleşme tek bir
          sayfayı, önek bir alt ağacın tamamını, regex ise desen eşleşmesini
          yakalar.
        </p>
        <div className="mt-4">
          <AddRedirectForm />
        </div>
      </section>

      {/* Bulk import */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Upload size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Toplu içe aktar
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Search Console / sitemap çıktısını yapıştırarak eski → yeni eşleşme
          tablosunu tek seferde yükleyin.
        </p>
        <div className="mt-4">
          <BulkImportForm />
        </div>
      </section>

      {/* Existing rules */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Signpost size={15} className="text-[#3c639f]" />
            <div className="text-[13px] font-semibold text-[#0a0a0a]">
              Kurallar
            </div>
          </div>
          <span className="text-[12px] text-black/50">{redirects.length} kayıt</span>
        </div>

        {redirects.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yönlendirme yok. Yukarıdan ekleyin veya toplu içe aktarın.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {redirects.map((r) => (
              <RedirectRow key={r.id} rule={r} />
            ))}
          </ul>
        )}
      </section>

      {/* Unmapped 404s */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[#3c639f]" />
            <div className="text-[13px] font-semibold text-[#0a0a0a]">
              Haritalanmamış 404&apos;ler
            </div>
          </div>
          {notFound.length > 0 && (
            <form action={clearNotFoundAction}>
              <button
                type="submit"
                className="rounded-md px-2.5 py-1 text-[12px] font-medium text-black/45 transition-colors hover:bg-black/[0.04] hover:text-black/70"
              >
                Listeyi temizle
              </button>
            </form>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Yönlendirme kuralı olmayan ve gerçek bir sayfaya denk gelmeyen
          adresler ziyaret edildikçe burada birikir. Envanterin kaçırdığı eski
          linkleri buradan tek tıkla yönlendirebilirsiniz.
        </p>

        {notFound.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Şu an haritalanmamış 404 yok.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {notFound.map((e) => (
              <li
                key={e.path}
                className="flex flex-col gap-2 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-mono text-[12.5px] text-[#0a0a0a]">
                    {e.path}
                  </div>
                  <div className="mt-0.5 text-[11px] text-black/40">
                    {e.count} kez · son: {formatDate(e.lastSeen)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapNotFoundForm source={e.path} />
                  <form action={dismissNotFoundAction}>
                    <input type="hidden" name="path" value={e.path} />
                    <button
                      type="submit"
                      aria-label="Listeden çıkar"
                      title="Listeden çıkar"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/[0.05] hover:text-black/70"
                    >
                      <X size={14} />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function RedirectRow({ rule }: { rule: Redirect }) {
  const typeLabel =
    rule.matchType === "exact" ? "Tam" : rule.matchType === "prefix" ? "Önek" : "Regex"
  return (
    <li className="overflow-hidden rounded-xl border border-black/[0.06] bg-[#fafbfd]">
      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[12.5px] text-[#0a0a0a]">
            <span className="truncate">{rule.source}</span>
            <ArrowRight size={13} className="shrink-0 text-black/30" />
            <span className="truncate text-[#3c639f]">{rule.destination}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge>{typeLabel}</Badge>
            <Badge tone={rule.permanent ? "blue" : "amber"}>
              {rule.permanent ? "301" : "302"}
            </Badge>
            {rule.preserveQuery && <Badge>?query</Badge>}
            {!rule.enabled && <Badge tone="gray">Pasif</Badge>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <form action={toggleRedirectAction}>
            <input type="hidden" name="id" value={rule.id} />
            <IconBtn label={rule.enabled ? "Pasifleştir" : "Aktifleştir"}>
              {rule.enabled ? <Power size={14} /> : <PowerOff size={14} />}
            </IconBtn>
          </form>
          <details className="group relative">
            <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a] [&::-webkit-details-marker]:hidden">
              <Pencil size={14} />
            </summary>
            <div className="absolute right-0 top-9 z-10 hidden w-[min(92vw,460px)] rounded-xl border border-black/[0.08] bg-white shadow-lg group-open:block">
              <EditRedirectForm rule={rule} />
            </div>
          </details>
          <form action={deleteRedirectAction}>
            <input type="hidden" name="id" value={rule.id} />
            <IconBtn label="Sil" variant="danger">
              <Trash2 size={14} />
            </IconBtn>
          </form>
        </div>
      </div>
    </li>
  )
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode
  tone?: "slate" | "blue" | "amber" | "gray"
}) {
  const tones: Record<string, string> = {
    slate: "bg-black/[0.05] text-black/55",
    blue: "bg-[#3c639f]/[0.1] text-[#3c639f]",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-black/[0.06] text-black/40",
  }
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

function IconBtn({
  children,
  label,
  variant = "default",
}: {
  children: React.ReactNode
  label: string
  variant?: "default" | "danger"
}) {
  const cls =
    variant === "danger"
      ? "text-black/40 hover:bg-red-50 hover:text-red-600"
      : "text-black/55 hover:bg-black/[0.05] hover:text-[#0a0a0a]"
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${cls}`}
    >
      {children}
    </button>
  )
}

function formatDate(iso: string): string {
  // Stable, locale-independent format so server render matches.
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

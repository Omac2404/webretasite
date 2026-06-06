import { Image as ImageIcon, Type, Plus, Trash2, ChevronUp, ChevronDown, ArrowLeftRight, Zap, Snail, BadgeCheck } from "lucide-react"
import { readLogos, type Logo, type LogoRow } from "@/lib/logos-store"
import { readMedia } from "@/lib/media-store"
import {
  deleteLogoAction,
  moveLogoAction,
  setGooglePartnerAction,
  setModeAction,
  swapRowAction,
} from "./actions"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { AddLogoForm } from "./add-logo-form"

export const dynamic = "force-dynamic"

export default async function LogosAdminPage() {
  const [{ mode, logos, googlePartner }, { items: media }] = await Promise.all([
    readLogos(),
    readMedia(),
  ])
  const rowA = logos.filter((l) => l.row === "a")
  const rowB = logos.filter((l) => l.row === "b")

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Referanslar
          </h1>
        </div>
        <PreviewLink href="/" />
      </div>

      {/* Google Partner badge toggle + URL */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Google Partner rozeti
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Anasayfa hero alanındaki rozeti açıp kapatabilir, tıklandığında
          gidilecek profil URL&apos;ini düzenleyebilirsin. URL boş bırakılırsa
          varsayılana döner.
        </p>
        <form
          action={setGooglePartnerAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[#0a0a0a]">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={googlePartner.enabled}
              className="h-4 w-4 rounded border-black/20 text-[#3c639f] focus:ring-[#3c639f]"
            />
            Rozeti göster
          </label>
          <div className="flex-1">
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
              Profil URL&apos;i
            </label>
            <input
              type="url"
              name="url"
              defaultValue={googlePartner.url}
              placeholder="https://www.google.com/partners/agency?id=…"
              className="mt-1 w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-[13px] text-[#0a0a0a] placeholder:text-black/30 focus:border-[#3c639f] focus:outline-none focus:ring-2 focus:ring-[#3c639f]/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#3c639f] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#2f5288]"
          >
            Kaydet
          </button>
        </form>
      </section>

      {/* Display mode toggle */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          Görüntüleme modu
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Şu anda{" "}
          <span className="font-medium text-[#3c639f]">
            {mode === "logos" ? "logolar" : "sadece isimler"}
          </span>{" "}
          gösteriliyor.
        </p>
        <div className="mt-4 flex gap-2">
          <form action={setModeAction}>
            <input type="hidden" name="mode" value="names" />
            <ModeButton active={mode === "names"} icon={<Type size={14} />}>
              Sadece isimler
            </ModeButton>
          </form>
          <form action={setModeAction}>
            <input type="hidden" name="mode" value="logos" />
            <ModeButton active={mode === "logos"} icon={<ImageIcon size={14} />}>
              Logoları göster
            </ModeButton>
          </form>
        </div>
      </section>

      {/* Add new logo */}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni logo ekle
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          Firma ismi, görsel ve hangi sırada akacağı. Görseli kütüphaneden
          seçebilir ya da bilgisayardan yükleyebilirsin.
        </p>
        <div className="mt-4">
          <AddLogoForm media={media} />
        </div>
      </section>

      {/* Existing logos — split into two rows */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RowColumn
          title="Üst sıra"
          subtitle="Hızlı · sola kayar"
          icon={<Zap size={14} className="text-[#3c639f]" />}
          rowKey="a"
          logos={rowA}
        />
        <RowColumn
          title="Alt sıra"
          subtitle="Yavaş · sağa kayar"
          icon={<Snail size={14} className="text-[#3c639f]" />}
          rowKey="b"
          logos={rowB}
        />
      </div>
    </div>
  )
}

function RowColumn({
  title,
  subtitle,
  icon,
  rowKey,
  logos,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  rowKey: LogoRow
  logos: Logo[]
}) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-[13px] font-semibold text-[#0a0a0a]">{title}</div>
          <span className="text-[11px] text-black/40">· {subtitle}</span>
        </div>
        <div className="text-[12px] text-black/50">{logos.length} kayıt</div>
      </div>

      {logos.length === 0 ? (
        <p className="mt-4 text-[13px] text-black/45">Bu sırada henüz logo yok.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {logos.map((logo, idx) => (
            <LogoRowItem
              key={logo.id}
              logo={logo}
              isFirst={idx === 0}
              isLast={idx === logos.length - 1}
              rowKey={rowKey}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function LogoRowItem({
  logo,
  isFirst,
  isLast,
}: {
  logo: Logo
  isFirst: boolean
  isLast: boolean
  rowKey: LogoRow
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3">
      <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/[0.06] bg-white">
        {logo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.imageUrl}
            alt={logo.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Type size={14} className="text-black/30" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#0a0a0a]">
          {logo.name}
        </div>
        <div className="truncate text-[11px] text-black/40">
          {logo.imageUrl || "Görsel yok"}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <form action={moveLogoAction}>
          <input type="hidden" name="id" value={logo.id} />
          <input type="hidden" name="direction" value="up" />
          <IconBtn label="Yukarı" disabled={isFirst}>
            <ChevronUp size={14} />
          </IconBtn>
        </form>
        <form action={moveLogoAction}>
          <input type="hidden" name="id" value={logo.id} />
          <input type="hidden" name="direction" value="down" />
          <IconBtn label="Aşağı" disabled={isLast}>
            <ChevronDown size={14} />
          </IconBtn>
        </form>
        <form action={swapRowAction}>
          <input type="hidden" name="id" value={logo.id} />
          <IconBtn label="Diğer sıraya taşı">
            <ArrowLeftRight size={14} />
          </IconBtn>
        </form>
        <form action={deleteLogoAction}>
          <input type="hidden" name="id" value={logo.id} />
          <IconBtn label="Sil" variant="danger">
            <Trash2 size={14} />
          </IconBtn>
        </form>
      </div>
    </li>
  )
}

function IconBtn({
  children,
  label,
  disabled = false,
  variant = "default",
}: {
  children: React.ReactNode
  label: string
  disabled?: boolean
  variant?: "default" | "danger"
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-md transition-colors"
  const enabled =
    variant === "danger"
      ? "text-black/40 hover:bg-red-50 hover:text-red-600"
      : "text-black/55 hover:bg-black/[0.05] hover:text-[#0a0a0a]"
  const dim = "cursor-not-allowed text-black/20"
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${base} ${disabled ? dim : enabled}`}
    >
      {children}
    </button>
  )
}

function ModeButton({
  active,
  icon,
  children,
}: {
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={
        active
          ? "flex items-center gap-1.5 rounded-lg bg-[#3c639f] px-3 py-2 text-[12.5px] font-medium text-white"
          : "flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[12.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.03]"
      }
    >
      {icon}
      {children}
    </button>
  )
}

import { Mail, Phone, MapPin, Clock } from "lucide-react"
import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooterServer"
import ContactForm from "@/components/ContactForm"
import { readContact } from "@/lib/contact-store"
import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/iletisim")
}

// Admin haritayı boş bıraktığında kullanılacak fallback — İzmir Konak.
// OpenStreetMap embed'i API key istemiyor.
const FALLBACK_MAP_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=27.0900,38.4100,27.1700,38.4500&layer=mapnik&marker=38.4192,27.1287"
const FALLBACK_MAP_SHARE =
  "https://www.openstreetmap.org/?mlat=38.4192&mlon=27.1287#map=14/38.4192/27.1287"

export const dynamic = "force-dynamic"

export default async function IletisimPage() {
  const content = await readContact()
  const mapSrc = content.map.embedSrc || FALLBACK_MAP_SRC
  const mapShare =
    content.map.shareUrl || (content.map.embedSrc ? "" : FALLBACK_MAP_SHARE)
  const phoneHref = `tel:${content.info.phone.replace(/\s|\(|\)/g, "")}`

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main>
        {/* Header band */}
        <section className="relative mx-auto max-w-[1280px] px-6 pb-10 pt-10 md:px-12 md:pb-14 md:pt-14">
          {content.hero.kicker && (
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
              {content.hero.kicker}
            </span>
          )}
          <h1
            className={`${
              content.hero.kicker ? "mt-3 " : ""
            }text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]`}
          >
            <TitleParts
              leading={content.hero.titleLeading}
              highlight={content.hero.titleHighlight}
              trailing={content.hero.titleTrailing}
            />
          </h1>
          <p className="mt-5 max-w-[600px] text-[15px] leading-relaxed text-black/60">
            {content.hero.intro}
          </p>
        </section>

        {/* Info cards */}
        <section className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={<Mail size={18} strokeWidth={1.75} />}
              label="E-posta"
              value={content.info.email}
              href={content.info.email ? `mailto:${content.info.email}` : undefined}
              track="iletisim:email"
            />
            <InfoCard
              icon={<Phone size={18} strokeWidth={1.75} />}
              label="Telefon"
              value={content.info.phone}
              href={content.info.phone ? phoneHref : undefined}
              track="iletisim:phone"
            />
            <InfoCard
              icon={<MapPin size={18} strokeWidth={1.75} />}
              label="Adres"
              value={content.info.addressLine2 || content.info.addressLine1}
              topRight={
                content.info.addressLine2 ? content.info.addressLine1 : ""
              }
            />
            <InfoCard
              icon={<Clock size={18} strokeWidth={1.75} />}
              label="Çalışma saatleri"
              value={content.info.hours}
            />
          </div>
        </section>

        {/* Form + Map */}
        <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                {content.form.kicker}
              </span>
              <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
                <TitleParts
                  leading={content.form.titleLeading}
                  highlight={content.form.titleHighlight}
                  trailing={content.form.titleTrailing}
                />
              </h2>
              <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-black/55">
                {content.form.intro}
              </p>

              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                {content.map.kicker}
              </span>
              <h2 className="mt-2 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[36px]">
                <TitleParts
                  leading={content.map.titleLeading}
                  highlight={content.map.titleHighlight}
                  trailing={content.map.titleTrailing}
                />
              </h2>
              <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-black/55">
                {content.map.intro}
              </p>

              <div className="mt-6 flex-1 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                <iframe
                  title="Webreta konum haritası"
                  src={mapSrc}
                  className="h-[420px] w-full lg:h-full lg:min-h-[460px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              {mapShare && (
                <a
                  href={mapShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
                >
                  Haritayı yeni sekmede aç
                  <MapPin size={13} />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function TitleParts({
  leading,
  highlight,
  trailing,
}: {
  leading: string
  highlight: string
  trailing: string
}) {
  return (
    <>
      {leading && <span className="font-normal">{leading} </span>}
      <span className="font-bold text-[#3c639f]">{highlight}</span>
      {trailing && <span className="font-normal">{trailing}</span>}
    </>
  )
}

function InfoCard({
  icon,
  label,
  value,
  topRight,
  href,
  track,
}: {
  icon: React.ReactNode
  label: string
  value: string
  // İkonun yanında (sağında) görünen ek metin — örn. adres kartında
  // ülke/şehir özetinin ana detaydan ayrı durması için. Verilmezse
  // ikon yalnız durur, kart eski tek-satırlı düzene döner.
  topRight?: string
  href?: string
  track?: string
}) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3c639f]/[0.08] text-[#3c639f]">
          {icon}
        </div>
        {topRight && (
          <span className="text-[13px] font-medium tracking-[-0.005em] text-[#0a0a0a]">
            {topRight}
          </span>
        )}
      </div>
      <div className="mt-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
          {label}
        </span>
        <p className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-[#0a0a0a]">
          {value}
        </p>
      </div>
    </>
  )

  const className =
    "group flex flex-col rounded-xl border border-black/[0.06] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3c639f]/25 hover:shadow-[0_8px_24px_-12px_rgba(60,99,159,0.18)]"

  if (href) {
    return (
      <a
        href={href}
        data-track={track}
        data-track-label={label}
        className={className}
      >
        {inner}
      </a>
    )
  }
  return <div className={className}>{inner}</div>
}

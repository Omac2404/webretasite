"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Globe, Phone, X } from "lucide-react"
import {
  toTelHref,
  toWhatsappHref,
  type FloatMenuConfig,
} from "@/lib/float-menu-types"

// Sadece mobilde alt kısımda görünen yüzen menü. Web Site / Reklamlar / İletişim
// üç buton yan yana bir blok halinde dursun. İletişime basılınca yukarı doğru
// telefon + WhatsApp seçimi açılır.
//
// Admin yollarında render edilmez. Config'i layout'tan prop olarak alıyoruz,
// böylece client navigation'larda tekrar fetch yok.
export default function FloatMenu({ config }: { config: FloatMenuConfig }) {
  const pathname = usePathname() ?? ""
  const [contactOpen, setContactOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Dış tıklama / Escape ile kapan. Kullanıcı menüden çıkarken kilitli kalmasın.
  useEffect(() => {
    if (!contactOpen) return
    function onDocClick(e: MouseEvent) {
      const target = e.target instanceof Node ? e.target : null
      if (!target) return
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setContactOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setContactOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("touchstart", onDocClick)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("touchstart", onDocClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [contactOpen])

  if (!config.enabled) return null
  if (pathname.startsWith("/admin")) return null

  const webEnabled = config.webSite.enabled
  const adsEnabled = config.ads.enabled
  const contactEnabled = config.contact.enabled
  const visibleCount = [webEnabled, adsEnabled, contactEnabled].filter(Boolean).length
  if (visibleCount === 0) return null

  const phoneHref = toTelHref(config.contact.phone)
  const whatsappHref = toWhatsappHref(
    config.contact.whatsapp,
    config.contact.whatsappMessage,
  )

  return (
    <>
      {/* Sayfa altında menüye yer açan boşluk — fixed menünün içeriği örtmemesi için. */}
      <div aria-hidden className="h-24 md:hidden" />

      <div
        ref={wrapperRef}
        className="fixed inset-x-3 bottom-3 z-[60] md:hidden"
        data-section="float-menu"
      >
        {/* İletişim aç/kapa paneli — sadece contact açıkken görünür. */}
        {contactOpen && contactEnabled && (
          <div className="mb-2 origin-bottom animate-[fm-pop_180ms_ease-out] rounded-2xl border border-black/[0.06] bg-white p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]">
            <div className="mb-2 flex items-center justify-between px-1.5 pt-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                Hemen bağlan
              </span>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                aria-label="Kapat"
                className="-mr-1 flex h-7 w-7 items-center justify-center rounded-full text-black/45 transition-colors hover:bg-black/5 hover:text-black/70"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {phoneHref && (
                <a
                  href={phoneHref}
                  data-track="floatmenu:phone"
                  data-track-label="Float menü Telefon"
                  onClick={() => setContactOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#3c639f] px-3 py-2.5 text-white transition-opacity active:opacity-85"
                >
                  <Phone size={15} strokeWidth={2.2} />
                  <span className="text-[12.5px] font-medium tracking-[-0.005em]">
                    Telefon
                  </span>
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="floatmenu:whatsapp"
                  data-track-label="Float menü WhatsApp"
                  onClick={() => setContactOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#25d366] px-3 py-2.5 text-white transition-opacity active:opacity-85"
                >
                  <WhatsAppGlyph size={15} />
                  <span className="text-[12.5px] font-medium tracking-[-0.005em]">
                    WhatsApp
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Ana 3'lü blok */}
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-black/[0.06] bg-white/95 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md">
          {webEnabled && (
            <FloatItem
              href={config.webSite.href}
              label={config.webSite.label}
              track="floatmenu:web-site"
              icon={<Globe size={20} strokeWidth={2} />}
            />
          )}
          {adsEnabled && (
            <FloatItem
              href={config.ads.href}
              label={config.ads.label}
              track="floatmenu:ads"
              icon={<BarChartGlyph />}
            />
          )}
          {contactEnabled && (
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              aria-expanded={contactOpen}
              aria-label={config.contact.label}
              data-track="floatmenu:contact-toggle"
              data-track-label="Float menü İletişim"
              className={`relative flex flex-col items-center justify-center gap-1 px-2 py-3 transition-colors active:bg-black/[0.04] ${
                contactOpen
                  ? "bg-[#3c639f] text-white"
                  : "text-[#0a0a0a]"
              }`}
            >
              <div
                className={`relative flex h-5 w-9 items-center justify-center ${
                  contactOpen ? "text-white" : "text-[#3c639f]"
                }`}
              >
                <Phone size={17} strokeWidth={2} className="absolute left-0" />
                <WhatsAppGlyph size={17} className="absolute right-0" />
              </div>
              <span className="text-[11px] font-medium tracking-[-0.005em]">
                {config.contact.label}
              </span>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fm-pop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}

function FloatItem({
  href,
  label,
  icon,
  track,
}: {
  href: string
  label: string
  icon: React.ReactNode
  track: string
}) {
  return (
    <a
      href={href}
      data-track={track}
      data-track-label={`Float menü ${label}`}
      className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-[#0a0a0a] transition-colors active:bg-black/[0.04]"
    >
      <span className="flex h-5 items-center text-[#3c639f]">{icon}</span>
      <span className="text-[11px] font-medium tracking-[-0.005em]">{label}</span>
    </a>
  )
}

// WhatsApp marka glyph'i — speech-bubble + handset silüeti. Dolu form, rengi
// currentColor'dan alır: ana butonda mavi (#3c639f), yeşil popover butonunda beyaz.
function WhatsAppGlyph({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

// Yükselen sütun grafik ikonu — Reklamlar butonu için. Dolu bloklar
// "büyüme/reklam performansı" hissini outline'dan daha güçlü taşıyor.
function BarChartGlyph() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <rect x="2.5" y="12" width="3.5" height="6" rx="1" />
      <rect x="8.25" y="8" width="3.5" height="10" rx="1" />
      <rect x="14" y="4" width="3.5" height="14" rx="1" />
    </svg>
  )
}

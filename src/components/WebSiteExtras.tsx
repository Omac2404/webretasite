"use client"

import { useEffect, useState } from "react"
import { Sparkles, ExternalLink } from "lucide-react"
import type { KobiBanner } from "@/lib/web-packages-types"
import { DotPattern } from "@/components/DotPattern"

const SEED_BANNER: KobiBanner = {
  imageUrl: "",
  eyebrow: "Webreta'dan",
  bigTitle: "KOBİ",
  bigSubtitle: "Küçük & Orta Ölçek",
  tags: ["Hızlı kurulum", "Sabit fiyat", "Sade panel"],
  rightEyebrow: "Aradığınız bu olabilir",
  title: "KOBİ'niz için hızlı ve bütçe dostu web sitesi",
  description:
    "Küçük ve orta ölçekli işletmeler için tasarladığımız Webreta KOBİ, kurumsal kimlik, içerik yönetimi ve mobil uyumlu modern bir tasarımı sabit fiyat ve hızlı teslimat sözüyle birleştiriyor. Karmaşaya girmeden, ihtiyacınız olan her şey: tek pakette.",
  bullets: [
    "2–3 hafta içinde yayında",
    "Sabit fiyat, sürpriz yok",
    "Sade içerik yönetim paneli",
    "Mobil + masaüstü uyumlu",
  ],
  ctaLabel: "Webreta KOBİ'yi keşfet",
  ctaHref: "https://kobi.webreta.com",
}

export default function WebSiteExtras() {
  // Admin-managed via /admin/web-paketleri. Seed renders on first paint;
  // /api/web-packages replaces it when the request resolves.
  const [banner, setBanner] = useState<KobiBanner>(SEED_BANNER)
  useEffect(() => {
    let cancelled = false
    fetch("/api/web-packages")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { kobiBanner?: KobiBanner } | null) => {
        if (cancelled || !data?.kobiBanner) return
        setBanner(data.kobiBanner)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const hasImage = banner.imageUrl && banner.imageUrl.trim().length > 0

  return (
    <>
      {/* ─── Webreta KOBİ Banner ─────────────────────────────────────────
          Cross-sell band promoting the lighter KOBİ product. Left panel is
          either a brand-gradient + animated halftone or an admin-uploaded
          image; right panel carries the copy + outbound CTA. */}
      <section className="relative mx-auto w-full max-w-[1180px] px-4 pb-12 pt-4 sm:px-6 md:pb-16 md:pt-6">
        {/* Dekoratif nokta deseni — hakkımızda CTA ile aynı dil. Banner
            kartının sol arkasına taşar, kart z-10 ile üstte kalır. */}
        <DotPattern
          style={{
            left: "-220px",
            top: "-40px",
            width: "560px",
            height: "560px",
            zIndex: 0,
          }}
          opacity={0.75}
        />
        <div
          className="relative z-10 overflow-hidden rounded-3xl bg-white"
          style={{
            border: '1px solid rgba(60, 99, 159, 0.10)',
            boxShadow:
              '0 2px 8px -2px rgba(60, 99, 159, 0.06), 0 24px 64px -16px rgba(60, 99, 159, 0.12)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[42%_58%]">
            {/* Visual side */}
            <div
              className="relative isolate flex min-h-[260px] items-center justify-center overflow-hidden p-8 md:min-h-[340px] md:p-10"
              style={
                hasImage
                  ? {
                      backgroundImage: `linear-gradient(135deg, rgba(60,99,159,0.55) 0%, rgba(47,82,136,0.60) 65%, rgba(36,63,107,0.65) 100%), url(${banner.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {
                      background:
                        'linear-gradient(135deg, #3c639f 0%, #2f5288 65%, #243f6b 100%)',
                    }
              }
            >
              {/* Decorative animated halftone dot grid (hidden when an
                  uploaded image is in use so we don't fight its texture). */}
              {!hasImage && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.85) 1.4px, transparent 1.4px)',
                    backgroundSize: '18px 18px',
                    maskImage:
                      'radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%)',
                    animation: 'kobiDots 12s linear infinite',
                  }}
                />
              )}
              {/* Soft glow blob */}
              {!hasImage && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(91,141,230,0.55) 0%, transparent 70%)',
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-start gap-5 text-white">
                {banner.eyebrow && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                    <Sparkles size={12} strokeWidth={2} />
                    {banner.eyebrow}
                  </span>
                )}
                <div className="leading-none">
                  <div className="text-[64px] font-semibold tracking-[-0.04em] md:text-[80px]">
                    {banner.bigTitle}
                  </div>
                  {banner.bigSubtitle && (
                    <div className="mt-1 text-[13px] font-medium tracking-[0.18em] text-white/75">
                      {banner.bigSubtitle}
                    </div>
                  )}
                </div>
                {banner.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {banner.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-[11px] font-medium text-white/90"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Copy side */}
            <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
              <div>
                {banner.rightEyebrow && (
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3c639f]">
                    {banner.rightEyebrow}
                  </div>
                )}
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[#0a0a0a] md:text-[30px]">
                  {banner.title}
                </h2>
              </div>
              {banner.description && (
                <p className="text-[15px] leading-relaxed text-black/65">
                  {banner.description}
                </p>
              )}
              {banner.bullets.length > 0 && (
                <ul className="grid grid-cols-1 gap-2 text-[14px] text-black/70 sm:grid-cols-2">
                  {banner.bullets.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#3c639f]"
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={banner.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="web-site:kobi-banner"
                  data-track-label={banner.ctaLabel}
                  className="cta-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-medium"
                >
                  {banner.ctaLabel}
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Halftone dot grid slowly drifting on the KOBİ banner */
        @keyframes kobiDots {
          0%   { background-position: 0 0; }
          100% { background-position: 36px 36px; }
        }
      `}</style>
    </>
  )
}

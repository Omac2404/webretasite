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
  ctaHref: "https://izmirwebsiteyaptirma.com",
}

export default function WebSiteExtras({
  banner: bannerProp,
}: {
  // Provided by the server (web-site page reads readWebPackages()). Seeding
  // state from it means the real KOBİ copy is in the first paint — no
  // default→real swap or layout jump. Falls back to the seed only if a
  // caller renders this without the prop.
  banner?: KobiBanner
} = {}) {
  const [banner, setBanner] = useState<KobiBanner>(bannerProp ?? SEED_BANNER)
  useEffect(() => {
    // When the server already provided the banner, skip the refetch — the
    // value matches and re-fetching would only risk a redundant render.
    if (bannerProp) return
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
  }, [bannerProp])

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
          className="relative z-10 overflow-hidden rounded-3xl"
          style={{
            background:
              'linear-gradient(135deg, #0f1e3a 0%, #1a3464 50%, #2f5288 100%)',
            border: '1px solid rgba(60, 99, 159, 0.25)',
            boxShadow:
              '0 2px 8px -2px rgba(15, 30, 58, 0.18), 0 24px 64px -16px rgba(15, 30, 58, 0.30)',
          }}
        >
          {/* Atmosfer halosu — kartın sağ-üstünde yumuşak mavi parıltı,
              dijital-reklamlar global CTA ile aynı dil. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full opacity-55"
            style={{
              background:
                'radial-gradient(circle at center, rgba(91, 141, 230, 0.45) 0%, rgba(60, 99, 159, 0.20) 35%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />
          {/* Yıldız tozu — derinlik için ince statik beyaz noktalar */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.55) 0.5px, transparent 1px), radial-gradient(circle at 32% 72%, rgba(255,255,255,0.4) 0.5px, transparent 1px), radial-gradient(circle at 68% 22%, rgba(255,255,255,0.5) 0.5px, transparent 1px), radial-gradient(circle at 82% 64%, rgba(255,255,255,0.4) 0.5px, transparent 1px), radial-gradient(circle at 48% 88%, rgba(255,255,255,0.4) 0.5px, transparent 1px)',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[42%_58%]">
            {/* Visual side — banner. Hafif daha açık navy ile sağ tarafa
                karşı görsel bir ayrım; sağda dikey ince mavi separator var. */}
            <div
              className="relative isolate flex min-h-[260px] items-center justify-center overflow-hidden p-8 md:min-h-[340px] md:border-r md:border-white/[0.08] md:p-10"
              style={
                hasImage
                  ? {
                      backgroundImage: `linear-gradient(135deg, rgba(26,52,100,0.78) 0%, rgba(47,82,136,0.78) 65%, rgba(60,99,159,0.78) 100%), url(${banner.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {
                      background:
                        'linear-gradient(135deg, #1a3464 0%, #2f5288 65%, #3c639f 100%)',
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5b8de6]/40 bg-[#5b8de6]/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#cfe0ff] backdrop-blur-sm">
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
                        className="rounded-full border border-[#5b8de6]/40 bg-[#5b8de6]/15 px-2.5 py-1 text-[11px] font-medium text-[#cfe0ff] backdrop-blur-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Copy side — koyu navy zemin, beyaz metin, brand-blue accent.
                Global CTA + hakkımızda CTA ile aynı DNA. */}
            <div className="relative flex flex-col justify-center gap-5 p-8 md:p-10">
              <div>
                {banner.rightEyebrow && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5b8de6]/40 bg-[#5b8de6]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#cfe0ff] backdrop-blur-sm">
                    {banner.rightEyebrow}
                  </div>
                )}
                <h2 className="mt-3 text-[26px] font-semibold leading-[1.18] tracking-[-0.02em] text-white md:text-[30px]">
                  {banner.title}
                </h2>
              </div>
              {banner.description && (
                <p className="text-[15px] leading-relaxed text-white/70">
                  {banner.description}
                </p>
              )}
              {banner.bullets.length > 0 && (
                <ul className="grid grid-cols-1 gap-2 text-[14px] text-white/80 sm:grid-cols-2">
                  {banner.bullets.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b8de6]"
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
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#1a3464] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:shadow-[0_18px_40px_-8px_rgba(0,0,0,0.55)]"
                >
                  {banner.ctaLabel}
                  <ExternalLink
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
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

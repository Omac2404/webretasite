"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Mail, Phone, MapPin, ArrowUpRight, ArrowRight, Check } from "lucide-react"
import {
  DEFAULT_FOOTER,
  SOCIAL_PLATFORMS,
  renderCopyright,
  type FooterConfig,
  type SocialPlatform,
} from "@/lib/footer-types"

// Brand glyphs — lucide-react 1.14.0 doesn't ship social icons. Keeping
// them inline avoids pulling a second icon dependency.
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function XIcon({ size = 16 }: { size?: number }) {
  // X (formerly Twitter) — solid mark, not stroke based, scaled to viewBox.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21l-6.49 7.41L22 22h-6.793l-5.32-6.94L3.8 22H1l6.94-7.93L1.5 2h6.94l4.83 6.36L18.244 2Zm-1.193 18.4h1.881L7.04 3.5H5.04l12.01 16.9Z" />
    </svg>
  )
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.83c0-2.52 1.49-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.25 0-1.63.78-1.63 1.58v1.91h2.78l-.45 2.9h-2.33V22c4.78-.75 8.44-4.91 8.44-9.93Z" />
    </svg>
  )
}

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<
  SocialPlatform,
  React.ComponentType<{ size?: number }>
> = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
}

const SOCIAL_LABELS: Record<SocialPlatform, string> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p.label]),
) as Record<SocialPlatform, string>

type NavItem = { href: string; label: string }
type LegalLink = { id: string; title: string; href: string }

// Phone hrefs need to be `tel:` clean; strip the visual formatting.
function telHref(raw: string): string {
  return `tel:${raw.replace(/\s|\(|\)|-/g, "")}`
}

export default function SiteFooter() {
  // First paint uses the same defaults the JSON file ships with, so the
  // footer never flashes empty before /api/footer responds.
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER)
  const [nav, setNav] = useState<NavItem[]>([])
  const [legalLinks, setLegalLinks] = useState<LegalLink[]>([])
  // Google Partner badge — admin /admin/referanslar > Google Partner. /api/logos
  // bunu config'in yanında dönüyor; ana sayfadakiyle aynı kaynak.
  const [googlePartner, setGooglePartner] = useState<{
    enabled: boolean
    url: string
  }>({ enabled: false, url: "" })

  useEffect(() => {
    let cancelled = false
    fetch("/api/footer")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data:
            | { config: FooterConfig; nav: NavItem[]; legalLinks: LegalLink[] }
            | null,
        ) => {
          if (cancelled || !data) return
          if (data.config) setConfig(data.config)
          if (Array.isArray(data.nav)) setNav(data.nav)
          if (Array.isArray(data.legalLinks)) setLegalLinks(data.legalLinks)
        },
      )
      .catch(() => {})
    fetch("/api/logos")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data:
            | { googlePartner?: { enabled?: boolean; url?: string } }
            | null,
        ) => {
          if (cancelled || !data?.googlePartner) return
          setGooglePartner({
            enabled: data.googlePartner.enabled !== false,
            url:
              typeof data.googlePartner.url === "string"
                ? data.googlePartner.url
                : "",
          })
        },
      )
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Only render socials that have a URL set — empty entries shouldn't
  // produce dead-end icon buttons.
  const visibleSocials = useMemo(
    () =>
      SOCIAL_PLATFORMS.filter((p) => (config.socials[p.key] ?? "").trim().length > 0).map(
        (p) => ({
          key: p.key,
          label: SOCIAL_LABELS[p.key],
          href: config.socials[p.key],
          Icon: SOCIAL_ICONS[p.key],
        }),
      ),
    [config.socials],
  )

  const copyright = renderCopyright(config.copyright)

  return (
    <footer className="relative mt-10 overflow-hidden bg-[#0a0e14] text-white md:mt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-40 h-[460px] w-[460px] rounded-full bg-[#3c639f]/[0.22] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-[#6a93ce]/[0.10] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3c639f]/40 to-transparent"
      />

      {/* CTA block — oversized headline + inline contact. Eyebrow above
          the title is intentionally absent so the headline sits at the
          very top of the section. */}
      <div className="relative mx-auto max-w-[1280px] px-6 pt-20 md:px-12 md:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h2 className="text-[44px] leading-[0.98] tracking-[-0.035em] md:text-[80px]">
              {config.titleLeading && (
                <>
                  <span className="font-normal text-white/85">
                    {config.titleLeading}{" "}
                  </span>
                  <br className="hidden md:block" />
                </>
              )}
              <span className="font-bold bg-gradient-to-r from-[#6a93ce] via-white to-[#6a93ce] bg-clip-text text-transparent">
                {config.titleHighlight}
              </span>
              {config.titleTrailing && (
                <span className="font-normal text-white/85">
                  {" "}
                  {config.titleTrailing}
                </span>
              )}
            </h2>
            {config.subtitle && (
              <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-white/55">
                {config.subtitle}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={config.ctaHref}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-[14px] font-medium text-[#0a0e14] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#3c639f] to-[#6a93ce] transition-transform duration-500 group-hover:translate-x-0"
                />
                <span className="relative transition-colors duration-300 group-hover:text-white">
                  {config.ctaLabel}
                </span>
                <ArrowRight
                  size={15}
                  className="relative transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                />
              </a>
              {config.contact.email && (
                <a
                  href={`mailto:${config.contact.email}`}
                  className="group inline-flex items-center gap-2 text-[14px] text-white/65 transition-colors hover:text-white"
                >
                  <span className="underline decoration-white/20 decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-[#6a93ce]">
                    {config.contact.email}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              )}
            </div>
          </div>

          {/* Direct-contact card */}
          <div className="lg:col-span-4 lg:pt-6">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6a93ce]">
                Direkt iletişim
              </span>
              <div className="mt-5 flex flex-col gap-4">
                {config.contact.phone && (
                  <a href={telHref(config.contact.phone)} className="group flex items-start gap-3">
                    <Phone size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                        Telefon
                      </div>
                      <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85 transition-colors group-hover:text-white">
                        {config.contact.phone}
                      </div>
                    </div>
                  </a>
                )}
                {config.contact.email && (
                  <a href={`mailto:${config.contact.email}`} className="group flex items-start gap-3">
                    <Mail size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                        E-posta
                      </div>
                      <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85 transition-colors group-hover:text-white">
                        {config.contact.email}
                      </div>
                    </div>
                  </a>
                )}
                {config.contact.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                        Merkez
                      </div>
                      <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85">
                        {config.contact.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Middle band — brand mark + horizontal nav + socials. */}
        <div className="mt-20 flex flex-col gap-8 border-t border-white/[0.06] py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex items-center gap-4">
            <a href="/" aria-label="Webreta" className="inline-flex items-center">
              <Image
                src="/brand/webreta-logo.webp"
                alt="Webreta"
                width={364}
                height={64}
                className="h-7 w-auto brightness-0 invert"
              />
            </a>

            {/* Google Partner — minimal, transparan badge. Footer zeminini
                miras alır, sadece tipografi + check + ince separator var.
                Admin /admin/referanslar > Google Partner ile yönetilir. */}
            {googlePartner.enabled && googlePartner.url && (
              <>
                <span
                  aria-hidden
                  className="h-7 w-px bg-white/15"
                />
                <a
                  href={googlePartner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="footer:partner-badge"
                  data-track-label="Footer Google Partner badge"
                  aria-label="Webreta Google Partner profili"
                  className="group inline-flex items-center gap-2 transition-opacity hover:opacity-90"
                >
                  <span
                    className="flex flex-col items-start leading-[1.0]"
                    style={{
                      fontFamily:
                        '"Google Sans", "Product Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    <span className="text-[13px] font-medium tracking-[-0.01em]">
                      <span style={{ color: "#4285F4" }}>G</span>
                      <span style={{ color: "#EA4335" }}>o</span>
                      <span style={{ color: "#FBBC05" }}>o</span>
                      <span style={{ color: "#4285F4" }}>g</span>
                      <span style={{ color: "#34A853" }}>l</span>
                      <span style={{ color: "#EA4335" }}>e</span>
                    </span>
                    <span className="mt-0.5 text-[13px] font-medium tracking-[-0.01em] text-white/55">
                      Partner
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #5b8de6 0%, #3c639f 100%)",
                    }}
                  >
                    <Check size={8} strokeWidth={3.5} className="text-white" />
                  </span>
                </a>
              </>
            )}
          </div>

          {nav.length > 0 && (
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[13px] text-white/55 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {visibleSocials.length > 0 && (
            <div className="flex items-center gap-2">
              {visibleSocials.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-transparent hover:text-white"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3c639f] to-[#6a93ce] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="relative">
                    <Icon />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom strip — copyright + admin-picked legal links. */}
        <div className="flex flex-col gap-3 pb-10 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/30">{copyright}</p>
          {legalLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/35">
              {legalLinks.map((link, idx) => (
                <span key={link.id} className="flex items-center gap-5">
                  {idx > 0 && (
                    <span aria-hidden className="h-1 w-1 rounded-full bg-white/15" />
                  )}
                  <a href={link.href} className="transition-colors hover:text-white/70">
                    {link.title}
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

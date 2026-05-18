import Image from "next/image"
import { Mail, Phone, MapPin, ArrowUpRight, ArrowRight } from "lucide-react"

// Social glyphs as inline SVGs — lucide-react 1.14.0 doesn't ship brand
// icons, and we'd rather not pull a second icon dependency for two marks.
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

// TODO: Replace placeholder contact details below with real values once
// Webreta's office address, phone number and inbox are finalised.
const CONTACT = {
  email: "hello@webreta.com",
  phone: "+90 (XXX) XXX XX XX",
  address: "İzmir, Türkiye",
}

const NAV = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Web Site", href: "/web-site" },
  { label: "Dijital Reklamlar", href: "/dijital-reklamlar" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
]

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedinIcon },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0a0e14] text-white">
      {/* Decorative brand-blue glow — off-axis, hand-placed. Pulls the eye
          toward the CTA without leaning on a rigid border or divider. */}
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

      {/* CTA block — oversized display headline + inline contact, breaks the
          "classic 4-column" footer rhythm. */}
      <div className="relative mx-auto max-w-[1280px] px-6 pt-20 md:px-12 md:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6a93ce]">
              Bir sonraki proje
            </span>
            <h2 className="mt-4 text-[44px] leading-[0.98] tracking-[-0.035em] md:text-[80px]">
              <span className="font-normal text-white/85">Sıradaki </span>
              <br className="hidden md:block" />
              <span className="font-bold bg-gradient-to-r from-[#6a93ce] via-white to-[#6a93ce] bg-clip-text text-transparent">
                başarı hikayesi
              </span>
              <span className="font-normal text-white/85"> sizinki olsun.</span>
            </h2>
            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-white/55">
              Bir e-posta, bir mesaj, bir telefon — yeterli. 24 saat içinde
              dönüş yapıyoruz.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/iletisim"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-[14px] font-medium text-[#0a0e14] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#3c639f] to-[#6a93ce] transition-transform duration-500 group-hover:translate-x-0"
                />
                <span className="relative transition-colors duration-300 group-hover:text-white">
                  Projeyi konuşalım
                </span>
                <ArrowRight
                  size={15}
                  className="relative transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="group inline-flex items-center gap-2 text-[14px] text-white/65 transition-colors hover:text-white"
              >
                <span className="underline decoration-white/20 decoration-1 underline-offset-[6px] transition-colors group-hover:decoration-[#6a93ce]">
                  {CONTACT.email}
                </span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>

          {/* Contact card — feels like a business card sitting on the layout */}
          <div className="lg:col-span-4 lg:pt-6">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6a93ce]">
                Direkt iletişim
              </span>
              <div className="mt-5 flex flex-col gap-4">
                <a
                  href={`tel:${CONTACT.phone.replace(/\s|\(|\)/g, "")}`}
                  className="group flex items-start gap-3"
                >
                  <Phone size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                      Telefon
                    </div>
                    <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85 transition-colors group-hover:text-white">
                      {CONTACT.phone}
                    </div>
                  </div>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex items-start gap-3"
                >
                  <Mail size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                      E-posta
                    </div>
                    <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85 transition-colors group-hover:text-white">
                      {CONTACT.email}
                    </div>
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-[3px] shrink-0 text-[#6a93ce]" strokeWidth={1.75} />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                      Merkez
                    </div>
                    <div className="mt-0.5 text-[15px] tracking-[-0.01em] text-white/85">
                      {CONTACT.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle band — brand mark + horizontal nav + socials.
            Light dividers only between the three groups for rhythm. */}
        <div className="mt-20 flex flex-col gap-8 border-t border-white/[0.06] py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <a href="/" aria-label="Webreta" className="inline-flex items-center">
            <Image
              src="/brand/webreta-logo.webp"
              alt="Webreta"
              width={364}
              height={64}
              className="h-7 w-auto brightness-0 invert"
            />
          </a>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] text-white/55 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
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
        </div>

        {/* Bottom strip — copyright + legal. Minimal, no extra bordering. */}
        <div className="flex flex-col gap-3 pb-10 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/30">
            © {year} Webreta · İzmir merkezli web ajansı
          </p>
          <div className="flex items-center gap-5 text-[12px] text-white/35">
            <a href="#" className="transition-colors hover:text-white/70">
              KVKK
            </a>
            <span aria-hidden className="h-1 w-1 rounded-full bg-white/15" />
            <a href="#" className="transition-colors hover:text-white/70">
              Çerez Politikası
            </a>
            <span aria-hidden className="h-1 w-1 rounded-full bg-white/15" />
            <a href="#" className="transition-colors hover:text-white/70">
              Gizlilik
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

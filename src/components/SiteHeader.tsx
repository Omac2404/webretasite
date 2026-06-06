"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, BookOpen, ArrowRight } from "lucide-react"

const NAV_ITEMS = [
  { label: "Anasayfa", href: "/", track: "header:nav:anasayfa" },
  { label: "Hakkımızda", href: "/hakkimizda", track: "header:nav:hakkimizda" },
  { label: "Web Site", href: "/web-site", track: "header:nav:web-site" },
  {
    label: "Dijital Reklamlar",
    href: "/dijital-reklamlar",
    track: "header:nav:dijital-reklamlar",
  },
  { label: "Referanslar", href: "/referanslar", track: "header:nav:referanslar" },
  { label: "İletişim", href: "/iletisim", track: "header:nav:iletisim" },
]

// Optional logoUrl override — defaults to the bundled logo. Pass an
// admin-uploaded path via SiteHeaderServer to swap site-wide.
export default function SiteHeader({
  logoUrl = "/brand/webreta-logo.webp",
}: {
  logoUrl?: string
} = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname() ?? "/"
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`)

  // Lock body scroll while the drawer is open, restore on close. Also
  // closes the drawer on Escape so keyboard users aren't trapped.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-[#fafafa]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-12">
        <a href="/" aria-label="Webreta" className="flex items-center">
          {logoUrl === "/brand/webreta-logo.webp" ? (
            <Image
              src={logoUrl}
              alt="Webreta"
              width={364}
              height={64}
              priority
              className="h-7 w-auto"
            />
          ) : (
            // Admin-uploaded logos can be any aspect ratio — use a plain
            // <img> so we don't have to commit to fixed width/height.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Webreta" className="h-7 w-auto" />
          )}
        </a>

        <div className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <a
                key={item.label}
                href={item.href}
                data-track={item.track}
                data-track-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`group relative rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-300 ${
                  active ? "text-[#3c639f]" : "text-[#0a0a0a] hover:text-[#3c639f]"
                }`}
              >
                {/* Yumuşak dalgalı marka-mavisi hare — hover/aktifte opacity
                    ile yumuşakça belirir, görünürken organik dalgalanır. */}
                <span
                  aria-hidden
                  className={`nav-aura pointer-events-none absolute inset-0${
                    active ? " is-active" : ""
                  }`}
                />
                <span className="relative">{item.label}</span>
              </a>
            )
          })}
        </div>

        <a
          href="/blog"
          data-track="header:blog-cta"
          data-track-label="Header Blog butonu"
          className="header-blog-link group hidden items-center gap-1.5 text-[14px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288] md:inline-flex"
        >
          <BookOpen
            size={15}
            strokeWidth={2.25}
            className="transition-transform duration-300 group-hover:-rotate-6"
          />
          <span>Blog</span>
          <ArrowRight
            size={14}
            strokeWidth={2.25}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-black/60 transition-colors hover:bg-black/[0.04] md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Menüyü aç"
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={22} />
        </button>
      </nav>
      </header>

      {/* Mobile drawer — rendered as a header sibling, not a child. The
          header uses backdrop-filter which creates a containing block for
          position: fixed descendants, so nesting the overlay inside would
          confine it to the header's 64px box. */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          tabIndex={mobileMenuOpen ? 0 : -1}
          aria-label="Menüyü kapat"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-[#0a0a0a]/35 backdrop-blur-[2px] transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Site menüsü"
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-[360px] flex-col bg-[#fafafa] shadow-[-24px_0_60px_-24px_rgba(10,10,10,0.25)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-black/[0.06] px-6">
            <Image
              src="/brand/webreta-logo.webp"
              alt="Webreta"
              width={364}
              height={64}
              className="h-7 w-auto"
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Menüyü kapat"
              className="flex h-10 w-10 items-center justify-center rounded-md text-black/60 transition-colors hover:bg-black/[0.04]"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    data-track={item.track}
                    data-track-label={item.label}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-black/[0.05] py-4 text-[17px] tracking-[-0.01em] text-[#0a0a0a] transition-colors hover:text-[#3c639f]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      size={16}
                      className="text-black/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#3c639f]"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-black/[0.06] p-6">
            <a
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="cta-primary inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[14px] font-medium"
            >
              <BookOpen size={15} strokeWidth={2.25} />
              Blog
            </a>
            <p className="mt-4 text-[12px] leading-relaxed text-black/45">
              Webreta · İzmir merkezli web ajansı
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

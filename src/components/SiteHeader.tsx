"use client"

import Image from "next/image"
import { useState } from "react"
import { Menu, X, BookOpen } from "lucide-react"

const NAV_ITEMS = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Web Site", href: "/web-site" },
  { label: "Dijital Reklamlar", href: "/dijital-reklamlar" },
  { label: "İletişim", href: "/iletisim" },
]

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-[#fafafa]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-12">
        <a href="/" aria-label="Webreta" className="flex items-center">
          <Image
            src="/brand/webreta-logo.webp"
            alt="Webreta"
            width={364}
            height={64}
            priority
            className="h-7 w-auto"
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14px] text-black/60 transition-colors hover:text-[#0a0a0a]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="/blog"
          data-track="header:blog-cta"
          data-track-label="Header Blog butonu"
          className="header-blog-cta cta-primary hidden items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium md:inline-flex"
          style={{ transformOrigin: "center" }}
        >
          <BookOpen
            size={14}
            strokeWidth={2.25}
            className="header-blog-icon"
          />
          <span>Blog</span>
        </a>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-black/60 transition-colors hover:bg-black/[0.04] md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-black/[0.06] bg-[#fafafa] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="py-2 text-[15px] text-black/70 transition-colors hover:text-[#0a0a0a]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/blog"
              className="cta-primary mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[14px] font-medium"
            >
              <BookOpen size={15} strokeWidth={2.25} />
              Blog
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

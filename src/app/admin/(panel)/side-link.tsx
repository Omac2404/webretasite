"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function SideLink({
  href,
  icon,
  disabled = false,
  children,
}: {
  href: string
  icon: React.ReactNode
  disabled?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const base =
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors"

  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${base} cursor-not-allowed text-black/30`}
        title="Yakında"
      >
        {icon}
        {children}
        <span className="ml-auto rounded bg-black/[0.04] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-black/40">
          Yakında
        </span>
      </span>
    )
  }

  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={
        active
          ? `${base} bg-[#3c639f]/[0.08] text-[#3c639f]`
          : `${base} text-black/65 hover:bg-black/[0.03] hover:text-[#0a0a0a]`
      }
    >
      {icon}
      {children}
    </Link>
  )
}

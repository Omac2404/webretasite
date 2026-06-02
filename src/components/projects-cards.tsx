"use client"

import { useEffect, useState } from "react"
import { ArrowRight, CheckCircle2, ExternalLink, X } from "lucide-react"
import { createPortal } from "react-dom"

// Shared "Neler Yaptık?" project card + popup. Used by both the homepage
// carousel (HomePageClient) and the /referanslar grid. Kept structurally
// identical so the two surfaces stay visually in sync — the only extras
// the referanslar page opts into are the always-visible "Daha fazla"
// button and the "Projeyi gör" link (both driven by props).

export type ProjectCardData = {
  // Present for store-backed projects; absent for the homepage seed list.
  id?: string
  company: string
  initials: string
  // When set, the card/popup shows the referans logo image in place of
  // the initials placeholder. Empty string falls back to initials.
  imageUrl?: string
  type: string
  date: string
  demand: string
  solution: string
  demandDetail: string
  solutionDetail: string
  // Optional external link — when set, the popup shows "Projeyi gör".
  siteUrl?: string
}

export function ProjectCard({
  project,
  isFocused,
  opacity,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  cardRef,
  moreButton = false,
}: {
  project: ProjectCardData
  isFocused: boolean
  opacity: number
  isHovered: boolean
  isMobile: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  cardRef?: React.Ref<HTMLDivElement>
  // Referanslar grid sets this so a "Daha fazla" affordance shows on every
  // breakpoint (the homepage only shows the mobile "Detaylar" chip).
  moreButton?: boolean
}) {
  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="group box-border flex h-full cursor-pointer flex-col rounded-xl px-5 py-5"
      style={{
        opacity: isHovered ? 1 : opacity,
        transform: isFocused ? 'scale(1.04)' : 'scale(1)',
        transformOrigin: 'center',
        background: '#ffffff',
        border: isHovered
          ? '1px solid rgba(60, 99, 159, 0.30)'
          : isFocused
            ? '1px solid rgba(60, 99, 159, 0.20)'
            : '0.5px solid rgba(0, 0, 0, 0.04)',
        boxShadow: isHovered
          ? '0 2px 4px 0 rgba(60, 99, 159, 0.08), 0 8px 20px -1px rgba(60, 99, 159, 0.16), 0 20px 44px -8px rgba(60, 99, 159, 0.18), 0 36px 76px -20px rgba(15, 23, 42, 0.12)'
          : isFocused
            ? '0 1px 3px 0 rgba(60, 99, 159, 0.06), 0 6px 16px -1px rgba(60, 99, 159, 0.14), 0 16px 36px -6px rgba(60, 99, 159, 0.16), 0 28px 60px -16px rgba(15, 23, 42, 0.12)'
            : '0 1px 2px 0 rgba(15, 23, 42, 0.02), 0 3px 10px -1px rgba(15, 23, 42, 0.04), 0 10px 24px -6px rgba(15, 23, 42, 0.05)',
        transition:
          'opacity 300ms ease-out, transform 500ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease-out, border-color 200ms ease-out',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header — wide logo placeholder (left), company name (middle), type
          chip (right). The placeholder is intentionally rectangular so real
          horizontal wordmarks will drop in cleanly later. Larger sizing
          kicks in only at lg+ so mobile keeps the original compact look. */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md lg:h-14 lg:w-24"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(60, 99, 159, 0.10)',
            boxShadow: '0 1px 2px rgba(60, 99, 159, 0.04)',
          }}
        >
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt={project.company}
              className="max-h-full max-w-full object-contain p-1"
              draggable={false}
            />
          ) : (
            <span className="text-[15px] font-bold tracking-tight text-[#3c639f] lg:text-[16px]">
              {project.initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-[#0a0a0a] lg:text-[15px]">
            {project.company}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em]"
          style={{
            background: 'rgba(60, 99, 159, 0.08)',
            color: '#3c639f',
          }}
        >
          {project.type}
        </span>
      </div>

      {/* Talep — pastel blue pill with the copy INLINE next to it */}
      <div className="mt-3.5 flex items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dbeafe',
            color: '#1d4ed8',
          }}
        >
          <ArrowRight size={11} strokeWidth={3} />
          Talep
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-[1.45] text-black/75 lg:text-[13px]">
          {project.demand}
        </p>
      </div>

      {/* Çözüm — pastel green pill with the copy INLINE next to it */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dcfce7',
            color: '#15803d',
          }}
        >
          <CheckCircle2 size={11} strokeWidth={3} />
          Çözüm
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-[1.45] text-black/75 lg:text-[13px]">
          {project.solution}
        </p>
      </div>

      {/* Bottom row — a "Detaylar"/"Daha fazla" affordance on the left signals
          the card is clickable (popup opens with the full case study); the
          publish date sits on the right as subtle metadata. The whole card
          already handles the click, so the chip is a styled span (no nested
          button). On the homepage the chip is mobile-only (lg:hidden) since
          desktop cards read as clickable on hover; the referanslar grid opts
          into an always-visible "Daha fazla" via the moreButton prop. */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            moreButton ? "" : "lg:hidden"
          }`}
          style={{
            // Referanslar "Daha fazla" fills solid blue while the card is
            // hovered; the homepage "Detaylar" chip keeps the light tint.
            background:
              moreButton && isHovered ? '#3c639f' : 'rgba(60, 99, 159, 0.08)',
            color: moreButton && isHovered ? '#ffffff' : '#3c639f',
          }}
        >
          {moreButton ? "Daha fazla" : "Detaylar"}
          <ArrowRight size={11} strokeWidth={2.5} />
        </span>
        <span className="text-[11px] text-black/35 lg:ml-auto">{project.date}</span>
      </div>
    </div>
  )
}

export function ProjectPopup({
  project,
  position,
  isMobile,
  onMouseEnter,
  onMouseLeave,
  onClose,
  trackTarget,
}: {
  project: ProjectCardData
  position: { left: number; top: number } | null
  isMobile: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClose: () => void
  // When set, the "Projeyi gör" link carries this data-track target so the
  // analytics panel can break down which references get clicked through.
  trackTarget?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  if (!mounted) return null

  const popupWidth = 420
  const isMobileLayout = isMobile || !position
  const siteUrl = project.siteUrl?.trim()

  const body = (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div
          className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(60, 99, 159, 0.10)',
            boxShadow: '0 1px 2px rgba(60, 99, 159, 0.04)',
          }}
        >
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt={project.company}
              className="max-h-full max-w-full object-contain p-1"
              draggable={false}
            />
          ) : (
            <span className="text-[16px] font-bold tracking-tight text-[#3c639f]">
              {project.initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[#0a0a0a]">
              {project.company}
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em]"
              style={{
                background: 'rgba(60, 99, 159, 0.08)',
                color: '#3c639f',
              }}
            >
              {project.type}
            </span>
          </div>
          <div className="mt-0.5 text-[12px] text-black/50">
            {project.date}
          </div>
        </div>
        {isMobileLayout && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/80"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="my-4 h-px shrink-0 bg-black/[0.06]" />

      {/* Talep — pastel blue pill (same as card, scaled up) */}
      <div className="shrink-0">
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dbeafe',
            color: '#1d4ed8',
          }}
        >
          <ArrowRight size={12} strokeWidth={3} />
          Talep
        </span>
        <p className="mt-2 text-[14px] leading-[1.6] text-black/80">
          {project.demandDetail}
        </p>
      </div>

      <div className="my-4 h-px shrink-0 bg-black/[0.06]" />

      {/* Çözüm — pastel green pill (same as card, scaled up) */}
      <div className="shrink-0">
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: '#dcfce7',
            color: '#15803d',
          }}
        >
          <CheckCircle2 size={12} strokeWidth={3} />
          Çözüm
        </span>
        <p className="mt-2 text-[14px] leading-[1.6] text-black/80">
          {project.solutionDetail}
        </p>
      </div>

      {/* Projeyi gör — opens the live project in a new tab. Only rendered
          when an admin entered a link for this project. */}
      {siteUrl && (
        <>
          <div className="my-4 h-px shrink-0 bg-black/[0.06]" />
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track={trackTarget}
            data-track-label={`Projeyi gör — ${project.company}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#3c639f] px-[18px] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2f5288]"
          >
            Projeyi gör
            <ExternalLink size={14} />
          </a>
        </>
      )}
    </>
  )

  const popupContent = isMobileLayout ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        className="popup-scroll relative mx-auto flex w-full flex-col rounded-xl bg-white p-5"
        style={{
          maxWidth: `${popupWidth}px`,
          maxHeight: '80vh',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow:
            '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 150ms ease-out, transform 150ms ease-out',
        }}
      >
        {body}
      </div>
    </div>
  ) : (
    <div
      className="fixed z-[100]"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateY(-50%)',
        width: `${popupWidth}px`,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 150ms ease-out, top 200ms ease-out, left 200ms ease-out',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="popup-scroll relative flex flex-col rounded-xl bg-white p-5"
        style={{
          maxHeight: '440px',
          border: '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow:
            '0 8px 32px -4px rgba(0, 0, 0, 0.08), 0 24px 64px -12px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Arrow pointing back to the card on the right */}
        <div
          className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rotate-45 bg-white"
          style={{
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            borderLeft: 'none',
            borderBottom: 'none',
          }}
        />
        {body}
      </div>
    </div>
  )

  return createPortal(popupContent, document.body)
}

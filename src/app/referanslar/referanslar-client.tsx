"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProjectCard, ProjectPopup, type ProjectCardData } from "@/components/projects-cards"
import { trackEvent } from "@/lib/track-client"

// Public /referanslar grid. Reuses the homepage project card + popup so the
// two surfaces stay in sync. Differences from the homepage carousel: every
// project is shown (not just the first 10), laid out as a two-column grid
// with an always-visible "Daha fazla" affordance.
// Unlike the homepage, hovering only highlights the card
// — the popup opens on CLICK (a centered modal), and carries a "Projeyi gör"
// link. The whole grid sits in a [data-section="referanslar"] wrapper so the
// analytics panel can report time-on-page; per-reference click-throughs are
// tracked via the popup link's data-track target.

type Category = "dev" | "ops"

type GridProject = ProjectCardData & { category: Category }

type ApiProject = {
  id: string
  company: string
  initials: string
  imageUrl: string
  category: Category
  type: string
  dateLabel: string
  demand: string
  solution: string
  demandDetail: string
  solutionDetail: string
  siteUrl: string
}

export default function ReferanslarClient() {
  const [projects, setProjects] = useState<GridProject[]>([])
  const [loaded, setLoaded] = useState(false)
  // Hover only drives the card's visual highlight (desktop). The popup is
  // gated on a separate click-driven `openId` so hovering never opens it.
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  // Load the full project archive — same endpoint the homepage uses.
  useEffect(() => {
    let cancelled = false
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { projects?: ApiProject[] } | null) => {
        if (cancelled || !data || !Array.isArray(data.projects)) return
        setProjects(
          data.projects.map((p) => ({
            id: p.id,
            company: p.company,
            initials: p.initials,
            imageUrl: p.imageUrl,
            category: p.category,
            type: p.type,
            date: p.dateLabel,
            demand: p.demand,
            solution: p.solution,
            demandDetail: p.demandDetail,
            solutionDetail: p.solutionDetail,
            siteUrl: p.siteUrl,
          })),
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Close the popup on Escape so keyboard users aren't trapped in the modal.
  useEffect(() => {
    if (openId === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openId])

  const visible = useMemo(
    () => projects.filter((p) => p.category === "dev"),
    [projects],
  )

  const openProject =
    openId === null ? null : visible.find((p) => p.id === openId) ?? null

  return (
    <section
      data-section="referanslar"
      className="mx-auto max-w-[1280px] px-6 pb-20 pt-10 md:px-12 md:pt-14"
    >
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]">
          <span className="font-normal">Neler </span>
          <span className="font-bold text-[#3c639f]">Yaptık?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-relaxed text-black/60">
          Bir karta tıklayın, talebi ve çözümü inceleyin.
        </p>
      </div>

      {/* Grid — two columns (çifterli). items-stretch keeps both cards in a
          row the same height. */}
      {!loaded ? (
        // Brief skeleton while /api/projects resolves — avoids flashing the
        // empty-state copy before the data lands.
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-xl bg-black/[0.04]"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-[14px] text-black/45">
          Bu kategoride henüz proje yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:gap-5">
          {visible.map((project) => (
            <div key={project.id} className="min-h-[200px]">
              <ProjectCard
                project={project}
                isFocused={false}
                opacity={1}
                isHovered={hoveredId === project.id}
                isMobile={false}
                moreButton
                onMouseEnter={() => setHoveredId(project.id!)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  // Count the card click itself as the reference interaction
                  // (feeds "en çok tıklanan referanslar" in the analytics
                  // panel). The card has no data-track attribute, so this
                  // programmatic event is the only one fired on open.
                  trackEvent({
                    type: "click",
                    target: `referanslar:proje:${project.id}`,
                    label: project.company,
                  })
                  setOpenId(project.id!)
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Alt CTA — daha fazla proje için iletişim. Footer'dan hemen önce. */}
      <div className="mt-16 flex flex-col items-center gap-5 border-t border-black/[0.06] pt-12 text-center">
        <p className="mx-auto max-w-[640px] text-[16px] font-medium tracking-[-0.01em] text-[#0a0a0a] md:text-[18px]">
          Daha fazla proje veya referans için bizimle iletişime geçebilir ya da
          Webreta KOBİ sitemizi inceleyebilirsiniz.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3c639f] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#2f5288]"
          >
            İletişime geç
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://izmirwebsiteyaptirma.com/neler-yaptik/"
            target="_blank"
            rel="noopener noreferrer"
            data-track="referanslar:kobi"
            data-track-label="Referanslar Webreta KOBİ"
            className="inline-flex items-center gap-2 rounded-lg border border-[#3c639f]/30 bg-white px-6 py-3 text-[14px] font-medium text-[#3c639f] transition-colors hover:bg-[#3c639f]/[0.06]"
          >
            Webreta KOBİ
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Popup — opens on click as a centered modal (not on hover). */}
      {openProject && (
        <ProjectPopup
          project={openProject}
          position={null}
          isMobile
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          onClose={() => setOpenId(null)}
          trackTarget={`referanslar:proje-git:${openProject.id ?? ""}`}
        />
      )}
    </section>
  )
}

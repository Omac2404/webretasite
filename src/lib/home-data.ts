// Server-only aggregator for the homepage's admin-managed sections. Reading
// these on the server and handing them to HomePageClient as props means the
// first paint already carries the real content — no default→real swap or the
// layout jump (CLS) it caused when an admin edited copy. The shapes mirror
// what the public /api/* routes return so the client can seed its state
// directly from these props.
//
// Server-only: imports stores that touch node:fs. Do not import from a
// client component.

import { readProjects } from "./projects-store"
import { readLogos } from "./logos-store"
import { readServices } from "./services-store"
import { isReviewVisible, readReviews } from "./reviews-store"
import {
  DEFAULT_PROJECTS_SIDEBAR,
  deriveInitials,
  formatPublishDate,
} from "./projects-types"

// Same 2-letter derivation the client used inline on /api/reviews data.
function reviewInitials(author: string): string {
  return author
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export type HomeData = {
  logos: {
    mode: "logos" | "names"
    entries: { id: string; name: string; imageUrl: string; row: "a" | "b" }[]
    googlePartner: { enabled: boolean; url: string }
  }
  services: {
    web: { title: string; bullets: string[] }
    reklam: { title: string; bullets: string[] }
  }
  projects: {
    id: string
    company: string
    initials: string
    imageUrl: string
    category: "dev" | "ops"
    type: string
    date: string
    demand: string
    solution: string
    demandDetail: string
    solutionDetail: string
    siteUrl: string
  }[]
  sidebar: {
    titleLeading: string
    titleHighlight: string
    description: string
    ctaLabel: string
    ctaHref: string
  }
  reviews: {
    summary: {
      rating: number
      reviewCount: number
      businessName: string
      reviewsUrl: string
    }
    testimonials: {
      text: string
      name: string
      role: string
      initials: string
      date: string
    }[]
  }
}

export async function readHomeData(): Promise<HomeData> {
  const [{ projects, sidebar }, logosData, servicesData, reviewsData] =
    await Promise.all([
      readProjects(),
      readLogos(),
      readServices(),
      readReviews(),
    ])

  // Projects joined with referans (logo) data — same enrichment /api/projects
  // performs so the carousel renders company name + logo immediately.
  const logoById = new Map(logosData.logos.map((l) => [l.id, l]))
  const mappedProjects = projects.map((p) => {
    const logo = logoById.get(p.companyId)
    const company = logo?.name ?? ""
    return {
      id: p.id,
      company,
      initials: deriveInitials(company),
      imageUrl: logo?.imageUrl ?? "",
      category: p.category,
      type: p.type,
      date: formatPublishDate(p.publishDate),
      demand: p.demand,
      solution: p.solution,
      demandDetail: p.demandDetail,
      solutionDetail: p.solutionDetail,
      siteUrl: p.siteUrl,
    }
  })

  // Services: cards[] → {web, reklam}. The store seeds defaults, so missing
  // keys just keep an empty bullet list (the section still renders).
  const services: HomeData["services"] = {
    web: { title: "Web Site", bullets: [] },
    reklam: { title: "Dijital Reklamlar", bullets: [] },
  }
  for (const c of servicesData.cards) {
    if (c.key === "web" || c.key === "reklam") {
      services[c.key] = { title: c.title, bullets: c.bullets }
    }
  }

  // Only publicly-visible reviews, with initials precomputed for the cards.
  const testimonials = reviewsData.reviews
    .filter((r) => isReviewVisible(r, reviewsData.minStars))
    .map((r) => ({
      text: r.text,
      name: r.author,
      role: "",
      initials: reviewInitials(r.author),
      date: r.date,
    }))

  return {
    logos: {
      mode: logosData.mode,
      entries: logosData.logos.map((l) => ({
        id: l.id,
        name: l.name,
        imageUrl: l.imageUrl,
        row: l.row,
      })),
      googlePartner: logosData.googlePartner,
    },
    services,
    projects: mappedProjects,
    sidebar: sidebar ?? DEFAULT_PROJECTS_SIDEBAR,
    reviews: { summary: reviewsData.summary, testimonials },
  }
}

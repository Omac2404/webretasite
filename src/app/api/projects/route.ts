import { NextResponse } from "next/server"
import { readProjects } from "@/lib/projects-store"
import { readLogos } from "@/lib/logos-store"
import { deriveInitials, formatPublishDate } from "@/lib/projects-types"

export const dynamic = "force-dynamic"

// Returns projects joined with referans (logo) data so the homepage
// renders company name + logo without a second round-trip.
export async function GET() {
  const [{ projects, sidebar }, { logos }] = await Promise.all([
    readProjects(),
    readLogos(),
  ])
  const logoById = new Map(logos.map((l) => [l.id, l]))
  const enriched = projects.map((p) => {
    const logo = logoById.get(p.companyId)
    const company = logo?.name ?? ""
    return {
      id: p.id,
      companyId: p.companyId,
      company,
      initials: deriveInitials(company),
      imageUrl: logo?.imageUrl ?? "",
      category: p.category,
      type: p.type,
      publishDate: p.publishDate,
      dateLabel: formatPublishDate(p.publishDate),
      demand: p.demand,
      solution: p.solution,
      demandDetail: p.demandDetail,
      solutionDetail: p.solutionDetail,
    }
  })
  return NextResponse.json(
    { projects: enriched, sidebar },
    { headers: { "Cache-Control": "no-store" } },
  )
}

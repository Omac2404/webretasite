import { NextResponse } from "next/server"
import { readFormLegal } from "@/lib/form-legal-store"
import { readLegalPages } from "@/lib/legal-store"
import {
  FORM_LEGAL_KEYS,
  type ResolvedFormLegal,
  type ResolvedLegalPage,
} from "@/lib/form-legal-types"

export const dynamic = "force-dynamic"

export async function GET() {
  const [requirements, { pages }] = await Promise.all([
    readFormLegal(),
    readLegalPages(),
  ])

  const byId = new Map(
    pages.map((p): [string, ResolvedLegalPage] => [
      p.id,
      { id: p.id, slug: p.slug, title: p.title },
    ]),
  )

  const out = {} as ResolvedFormLegal
  for (const key of FORM_LEGAL_KEYS) {
    const ids = requirements[key] ?? []
    out[key] = ids
      .map((id) => byId.get(id))
      .filter((p): p is ResolvedLegalPage => Boolean(p))
  }

  return NextResponse.json(out, {
    headers: { "Cache-Control": "no-store" },
  })
}

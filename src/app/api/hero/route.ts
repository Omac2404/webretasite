import { NextResponse } from "next/server"
import { readHero } from "@/lib/hero-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readHero()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

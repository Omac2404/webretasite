import { NextResponse } from "next/server"
import { readLogos } from "@/lib/logos-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readLogos()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

import { NextResponse } from "next/server"
import { readAbout } from "@/lib/about-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readAbout()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

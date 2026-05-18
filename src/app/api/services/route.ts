import { NextResponse } from "next/server"
import { readServices } from "@/lib/services-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readServices()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

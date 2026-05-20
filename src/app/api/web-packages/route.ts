import { NextResponse } from "next/server"
import { readWebPackages } from "@/lib/web-packages-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readWebPackages()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

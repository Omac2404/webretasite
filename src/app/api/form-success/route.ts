import { NextResponse } from "next/server"
import { readFormSuccess } from "@/lib/form-success-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const data = await readFormSuccess()
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  })
}

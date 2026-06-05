import { notFound } from "next/navigation"
import { logNotFound } from "@/lib/notfound-log-store"

// Root catch-all. Real routes (/hakkimizda, /blog/[slug], …) take
// priority, so this only runs for paths with no page. The redirect
// middleware (proxy.ts) has already run by this point, so anything that
// reaches here is a genuine 404 with no redirect rule — we log it for the
// admin "haritalanmamış 404'ler" list, then render the standard not-found
// page. This is how WordPress-era links the migration inventory missed
// get surfaced so they can be mapped.
export const dynamic = "force-dynamic"

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const path = "/" + (slug ?? []).join("/")
  await logNotFound(path)
  notFound()
}

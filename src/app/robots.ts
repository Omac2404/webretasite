// Dynamic robots.txt. Always disallows /admin and /api. References
// the sitemap (siteUrl is admin-controlled via /admin/seo).

import type { MetadataRoute } from "next"
import { readSeo } from "@/lib/seo-store"

export const dynamic = "force-dynamic"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await readSeo()
  const base = seo.global.siteUrl || "https://webreta.com.tr"
  const trimmedBase = base.replace(/\/+$/, "")

  const disallow = ["/admin", "/admin/", "/api/"]
  if (!seo.sitemap.includeLegalPages) {
    disallow.push("/yasal/")
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${trimmedBase}/sitemap.xml`,
  }
}

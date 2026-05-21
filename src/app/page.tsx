import HomePageClient from "@/components/HomePageClient"
import { buildPageMetadata } from "@/lib/seo-metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return buildPageMetadata("/")
}

export default function HomePage() {
  return <HomePageClient />
}

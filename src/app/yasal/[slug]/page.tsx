import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooter"
import { getLegalPageBySlug } from "@/lib/legal-store"
import { readSeo } from "@/lib/seo-store"

export const dynamic = "force-dynamic"

// Legal pages: noindex unless admin explicitly opts them into the
// sitemap from /admin/seo. Robots.txt also blocks /yasal/ by default.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [page, seo] = await Promise.all([
    getLegalPageBySlug(slug),
    readSeo(),
  ])
  const allow = seo.sitemap.includeLegalPages
  return {
    title: page?.title ?? "Yasal Sayfa",
    robots: allow
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getLegalPageBySlug(slug)
  if (!page) notFound()

  // Plain-text body — split on blank lines to render each block as a
  // paragraph. Single newlines inside a block are honored as line
  // breaks so manually formatted text (like address blocks) keeps its
  // layout without forcing the admin into markdown.
  const blocks = page.body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-6 pb-24 pt-16 md:px-12 md:pt-24">
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-[#0a0a0a] md:text-[44px]">
          {page.title}
        </h1>
        <div className="mt-3 text-[12.5px] text-black/40">
          Son güncelleme: {new Date(page.updatedAt).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <article className="mt-10 flex flex-col gap-5 text-[15.5px] leading-[1.7] text-black/75">
          {blocks.map((block, i) => (
            <p key={i} className="whitespace-pre-line">
              {block}
            </p>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

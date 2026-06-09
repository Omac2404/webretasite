import Link from "next/link"
import SiteHeader from "@/components/SiteHeaderServer"
import SiteFooter from "@/components/SiteFooterServer"
import { BlogSearchableGrid } from "@/components/BlogSearchableGrid"
import { listPublished } from "@/lib/blog-store"
import { readAuthors } from "@/lib/authors-store"
import { CATEGORIES, type CategoryKey } from "@/lib/blog-types"
import { buildPageMetadata } from "@/lib/seo-metadata"

export async function generateMetadata() {
  return buildPageMetadata("/blog")
}

export const dynamic = "force-dynamic"

function isCategoryKey(v: string | undefined): v is CategoryKey {
  return v === "teknik" || v === "haberler"
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const params = await searchParams
  const activeCat: CategoryKey | "all" = isCategoryKey(params.cat)
    ? params.cat
    : "all"

  const [allPosts, { authors }] = await Promise.all([
    listPublished(),
    readAuthors(),
  ])
  const posts =
    activeCat === "all"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCat)

  // Only ship authors referenced by the posts shown — keeps the client
  // payload tight.
  const referenced = new Set(posts.map((p) => p.authorId).filter(Boolean))
  const authorsById: Record<string, (typeof authors)[number]> =
    Object.fromEntries(
      authors.filter((a) => referenced.has(a.id)).map((a) => [a.id, a]),
    )

  const counts: Record<string, number> = { all: allPosts.length }
  for (const c of CATEGORIES) {
    counts[c.key] = allPosts.filter((p) => p.category === c.key).length
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-6 pb-12 pt-10 md:px-12 md:pb-16 md:pt-14">
        <div className="text-center">
          <h1 className="text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]">
            <span className="font-normal">Webreta </span>
            <span className="font-bold text-[#3c639f]">Blog</span>
          </h1>
        </div>

        {/* Category tabs — same segmented-control language as the
            dijital-reklamlar page so the two pages feel like siblings. */}
        <div className="mt-10 flex justify-center">
          <div
            className="inline-flex shrink-0 items-center rounded-full p-1"
            style={{
              background: "#f1f3f7",
              border: "1px solid rgba(60, 99, 159, 0.08)",
            }}
          >
            <CategoryTab
              href="/blog"
              active={activeCat === "all"}
              label="Tümü"
              count={counts.all}
              value="all"
            />
            {CATEGORIES.map((c) => (
              <CategoryTab
                key={c.key}
                href={`/blog?cat=${c.key}`}
                active={activeCat === c.key}
                label={c.label}
                count={counts[c.key] ?? 0}
                value={c.key}
              />
            ))}
          </div>
        </div>

        <BlogSearchableGrid posts={posts} authors={authorsById} />
      </main>
      <SiteFooter />
    </div>
  )
}

function CategoryTab({
  href,
  active,
  label,
  count,
  value,
}: {
  href: string
  active: boolean
  label: string
  count: number
  value: string
}) {
  return (
    <Link
      href={href}
      data-track-tab-control="blog-category"
      data-track-tab-value={value}
      data-track-label={label}
      className="relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors md:px-6"
      style={{
        background: active ? "#ffffff" : "transparent",
        color: active ? "#3c639f" : "rgba(0,0,0,0.5)",
        boxShadow: active
          ? "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px -4px rgba(60, 99, 159, 0.18)"
          : "none",
      }}
    >
      {label}
      <span
        className="text-[11px] tabular-nums"
        style={{ color: active ? "rgba(60,99,159,0.55)" : "rgba(0,0,0,0.30)" }}
      >
        {count}
      </span>
    </Link>
  )
}

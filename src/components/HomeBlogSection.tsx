"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { BlogCard } from "./BlogCard"
import type { BlogPost } from "@/lib/blog-types"
import type { Author } from "@/lib/authors-types"

// Client island that fetches the latest 3 published posts via /api/blog
// and renders them at the bottom of the homepage. We do this client-side
// because the homepage is itself a client component — server fetching
// would require a larger refactor.

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [authors, setAuthors] = useState<Record<string, Author>>({})

  useEffect(() => {
    let cancelled = false
    fetch("/api/blog?limit=3")
      .then((r) => r.json())
      .then((data: { posts?: BlogPost[]; authors?: Record<string, Author> }) => {
        if (cancelled) return
        setPosts(data.posts ?? [])
        setAuthors(data.authors ?? {})
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Skip the section entirely if there are no posts. No skeleton during
  // the fetch — at this scroll depth a brief gap is better than a fake
  // loading shimmer.
  if (posts === null || posts.length === 0) return null

  return (
    <section className="relative mx-auto max-w-[1280px] border-t border-black/[0.06] px-6 py-16 md:px-12 md:py-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
            Blog
          </span>
          <h2 className="mt-2 text-[32px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[44px]">
            <span className="font-normal">Son </span>
            <span className="font-bold text-[#3c639f]">yazılarımız</span>
          </h2>
        </div>
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#3c639f] transition-colors hover:text-[#2f5288]"
        >
          Tüm yazıları gör
          <ArrowRight size={15} />
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            author={authors[post.authorId]}
          />
        ))}
      </div>
    </section>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { BlogCard } from "./BlogCard"
import type { BlogPost } from "@/lib/blog-types"
import type { Author } from "@/lib/authors-types"

// Lowercase + Turkish-character fold so "Üçer" matches "ucer" etc.
function fold(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
}

export function BlogSearchableGrid({
  posts,
  authors,
}: {
  posts: BlogPost[]
  authors: Record<string, Author>
}) {
  const [query, setQuery] = useState("")

  // Pre-compute a folded haystack per post once per posts-array change, so
  // typing into the input doesn't re-fold the same content on every keystroke.
  const index = useMemo(
    () =>
      posts.map((p) => ({
        post: p,
        haystack: fold(
          [p.title, p.excerpt, p.content, authors[p.authorId]?.name ?? ""].join(
            " ",
          ),
        ),
      })),
    [posts, authors],
  )

  const trimmed = query.trim()
  const filtered = trimmed
    ? index.filter((entry) => entry.haystack.includes(fold(trimmed)))
    : index

  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-[520px] items-center gap-2 rounded-full border border-black/[0.10] bg-white px-4 py-2.5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] focus-within:border-[#3c639f]/40 focus-within:shadow-[0_4px_18px_-6px_rgba(60,99,159,0.18)]">
        <Search size={16} className="shrink-0 text-black/40" strokeWidth={2} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Yazılarda ara…"
          className="flex-1 bg-transparent text-[14px] text-[#0a0a0a] placeholder:text-black/40 focus:outline-none"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Aramayı temizle"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/[0.05] hover:text-black/70"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {trimmed && (
        <p className="mt-3 text-center text-[12.5px] text-black/45">
          {filtered.length === 0
            ? `"${trimmed}" için sonuç bulunamadı`
            : `"${trimmed}" için ${filtered.length} sonuç`}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-black/[0.08] bg-white py-16 text-center">
          <p className="text-[14px] text-black/55">
            {trimmed
              ? "Aramanızla eşleşen bir yazı yok."
              : "Bu kategoride henüz yazı yok."}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3">
          {filtered.map(({ post }) => (
            <BlogCard
              key={post.id}
              post={post}
              author={authors[post.authorId]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

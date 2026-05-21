"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Eye, EyeOff, Pencil, Search, Trash2, X } from "lucide-react"
import {
  CATEGORIES,
  formatDate,
  type BlogPost,
  type CategoryKey,
} from "@/lib/blog-types"
import { deletePostAction, togglePublishedAction } from "./actions"

type StatusFilter = "all" | "published" | "draft"
type CategoryFilter = "all" | CategoryKey

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

export function AdminPostsList({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")

  // Counts per category (after status filter only) so the chips can show
  // useful totals without being affected by the text query.
  const categoryCounts = useMemo(() => {
    const base = posts.filter((p) =>
      status === "all"
        ? true
        : status === "published"
          ? p.published
          : !p.published,
    )
    const counts: Record<CategoryFilter, number> = {
      all: base.length,
      teknik: 0,
      haberler: 0,
    }
    for (const p of base) counts[p.category]++
    return counts
  }, [posts, status])

  const index = useMemo(
    () =>
      posts.map((p) => ({
        post: p,
        haystack: fold([p.title, p.excerpt, p.slug].join(" ")),
      })),
    [posts],
  )

  const trimmed = query.trim()
  const filtered = useMemo(() => {
    const q = trimmed ? fold(trimmed) : ""
    return index.filter(({ post, haystack }) => {
      if (q && !haystack.includes(q)) return false
      if (category !== "all" && post.category !== category) return false
      if (status === "published" && !post.published) return false
      if (status === "draft" && post.published) return false
      return true
    })
  }, [index, trimmed, category, status])

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-black/[0.10] bg-white px-3 py-2 focus-within:border-[#3c639f]/50">
          <Search size={14} className="shrink-0 text-black/40" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık, özet veya slug ara…"
            className="flex-1 bg-transparent text-[13px] text-[#0a0a0a] placeholder:text-black/40 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-md p-0.5 text-black/40 hover:bg-black/[0.05] hover:text-[#0a0a0a]"
              aria-label="Aramayı temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-black/[0.10] bg-white px-3 py-2 text-[12.5px] text-[#0a0a0a] focus:border-[#3c639f]/50 focus:outline-none"
          >
            <option value="all">Tümü</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryChip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="Tüm kategoriler"
          count={categoryCounts.all}
        />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.key}
            active={category === c.key}
            onClick={() => setCategory(c.key)}
            label={c.label}
            count={categoryCounts[c.key]}
          />
        ))}
        <span className="ml-auto text-[12px] text-black/50">
          {filtered.length} / {posts.length} yazı
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/[0.10] bg-[#fafbfd] px-4 py-8 text-center text-[13px] text-black/50">
          Bu kriterlere uyan yazı yok.
          {(query || category !== "all" || status !== "all") && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setCategory("all")
                  setStatus("all")
                }}
                className="font-medium text-[#3c639f] hover:underline"
              >
                Filtreleri temizle
              </button>
            </>
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map(({ post }) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-[#3c639f] text-white"
          : "bg-white text-black/65 ring-1 ring-inset ring-black/[0.10] hover:bg-black/[0.04]"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10.5px] ${
          active ? "bg-white/20 text-white" : "bg-black/[0.06] text-black/55"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function PostRow({ post }: { post: BlogPost }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3">
      <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/[0.06] bg-white">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(135deg, #3c639f 0%, #5b8de6 100%)",
            }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-[#0a0a0a]">
            {post.title}
          </span>
          {!post.published && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-amber-800">
              Taslak
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-[#3c639f]/8 px-1.5 py-0.5 text-[10px] font-medium text-[#3c639f]">
            {post.category === "haberler" ? "Bizden Haberler" : "Teknik"}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-black/40">
          <span>{formatDate(post.createdAt)}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-black/15" />
          <span className="truncate">/blog/{post.slug}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={`/admin/blog/${post.id}`}
          aria-label="Düzenle"
          title="Düzenle"
          className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
        >
          <Pencil size={14} />
        </Link>
        <form action={togglePublishedAction}>
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            aria-label={post.published ? "Taslağa al" : "Yayına al"}
            title={post.published ? "Taslağa al" : "Yayına al"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
          >
            {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </form>
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            aria-label="Sil"
            title="Sil"
            className="flex h-8 w-8 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>
    </li>
  )
}

import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"
import { BlogCard } from "@/components/BlogCard"
import { AuthorAvatar } from "@/components/AuthorChip"
import { getPostBySlug, listPublished } from "@/lib/blog-store"
import { getAuthorById, readAuthors } from "@/lib/authors-store"
import {
  formatDate,
  readingTimeMinutes,
  type BlogPost,
} from "@/lib/blog-types"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Yazı bulunamadı | Webreta" }
  return {
    title: `${post.title} | Webreta`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [author, all, allAuthorsData] = await Promise.all([
    post.authorId ? getAuthorById(post.authorId) : Promise.resolve(null),
    listPublished(),
    readAuthors(),
  ])
  const authorsById = new Map(allAuthorsData.authors.map((a) => [a.id, a]))
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-6 py-12 md:px-12 md:py-16">
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-black/55 transition-colors hover:text-[#3c639f]"
        >
          <ArrowLeft size={14} />
          Tüm yazılar
        </a>

        <article className="mt-8">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
            <span>{formatDate(post.createdAt)}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-black/20" />
            <span>{readingTimeMinutes(post.content)} dk okuma</span>
          </div>

          <h1 className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] md:text-[44px]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-[17px] leading-relaxed text-black/65">
              {post.excerpt}
            </p>
          )}

          {/* Author byline — sits between excerpt and cover so it grabs
              attention without crowding the title. */}
          {author && (
            <div className="mt-6 flex items-center gap-3">
              <AuthorAvatar author={author} size={40} />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-[#0a0a0a]">
                  {author.name}
                </div>
                <div className="text-[12.5px] text-black/55">
                  {author.expertise}
                </div>
              </div>
            </div>
          )}

          {post.coverImage && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full"
              />
            </div>
          )}

          <div className="prose-blog mt-8 text-[16px] leading-[1.75] text-[#1a1a1a]">
            <RenderContent content={post.content} />
          </div>

          {/* Author bio block at the bottom — a slightly larger version of
              the byline so the reader can connect the writing to a real
              person without scrolling back up. */}
          {author && (
            <aside className="mt-14 flex items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-5">
              <AuthorAvatar author={author} size={56} />
              <div className="leading-tight">
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                  Yazar
                </div>
                <div className="mt-1 text-[16px] font-semibold text-[#0a0a0a]">
                  {author.name}
                </div>
                <div className="text-[13px] text-black/60">
                  {author.expertise}
                </div>
              </div>
            </aside>
          )}
        </article>

        {related.length > 0 && (
          <aside className="mt-20 border-t border-black/[0.08] pt-12">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.10em] text-[#3c639f]">
              Diğer yazılar
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((p) => (
                <BlogCard
                  key={p.id}
                  post={p}
                  author={authorsById.get(p.authorId)}
                />
              ))}
            </div>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

// Markdown-ish renderer: paragraphs split by blank lines. Block-level
// patterns: "## " h2, "### " h3, "![alt](url)" standalone image. Inline:
// **bold** and [text](url) links.
function RenderContent({ content }: { content: string }) {
  // Normalize CRLF (admin browsers on Windows submit \r\n) before splitting
  // on blank lines — otherwise the whole post collapses to a single
  // paragraph because /\n{2,}/ doesn't match "\r\n\r\n".
  const normalized = content.replace(/\r\n/g, "\n")
  const blocks = normalized.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mt-10 mb-4 text-[24px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
            >
              {renderInline(block.slice(3))}
            </h2>
          )
        }
        if (block.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="mt-8 mb-3 text-[19px] font-semibold tracking-[-0.01em] text-[#0a0a0a]"
            >
              {renderInline(block.slice(4))}
            </h3>
          )
        }
        // Standalone image block: a line containing only ![alt](url)
        const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (imgMatch) {
          const alt = imgMatch[1]
          const src = imgMatch[2]
          return (
            <figure key={i} className="my-8 -mx-0">
              <div className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="w-full" />
              </div>
              {alt && (
                <figcaption className="mt-2 text-center text-[12.5px] text-black/50">
                  {alt}
                </figcaption>
              )}
            </figure>
          )
        }
        // YouTube embed block: a line containing only [youtube](url-or-id)
        const ytMatch = block.match(/^\[youtube\]\(([^)]+)\)$/i)
        if (ytMatch) {
          const id = extractYouTubeId(ytMatch[1])
          if (id) {
            return (
              <div
                key={i}
                className="my-8 overflow-hidden rounded-xl border border-black/[0.06]"
              >
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            )
          }
        }
        return (
          <p key={i} className="mb-5">
            {renderInline(block)}
          </p>
        )
      })}
    </>
  )
}

// Inline: **bold** and [text](url) links. Done with a single combined
// regex split so order is preserved.
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#0a0a0a]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          className="text-[#3c639f] underline underline-offset-2 hover:text-[#2f5288]"
        >
          {link[1]}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// Pull a YouTube video ID out of any common URL form, or accept a raw ID.
// Returns null if we can't figure it out — caller renders a fallback.
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()
  // Already an ID-like string (11 chars, alphanumeric + - _)
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1)
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v")
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      // /embed/ID or /shorts/ID
      const m = url.pathname.match(/^\/(embed|shorts)\/([A-Za-z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // Not a URL — try last-ditch regex on the raw input.
  }
  const fallback = trimmed.match(/[A-Za-z0-9_-]{11}/)
  return fallback ? fallback[0] : null
}

export type { BlogPost }

import { ArrowRight, BookOpen } from "lucide-react"
import {
  deriveExcerpt,
  formatDate,
  readingTimeMinutes,
  type BlogPost,
} from "@/lib/blog-types"
import type { Author } from "@/lib/authors-types"
import { AuthorChip } from "./AuthorChip"

// Single card used both on the home grid and the /blog index. Renders a
// gradient placeholder when the post has no cover image so the layout
// stays consistent regardless of editorial choices. If the post has an
// author, a chip floats over the cover/body seam.
export function BlogCard({
  post,
  author,
}: {
  post: BlogPost
  author?: Author | null
}) {
  const excerpt = post.excerpt?.trim() || deriveExcerpt(post.content)
  const minutes = readingTimeMinutes(post.content)

  return (
    <a
      href={`/blog/${post.slug}`}
      data-track={`blog:card:${post.slug}`}
      data-track-label={post.title}
      className="group relative flex flex-col rounded-2xl border border-black/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#3c639f]/25 hover:shadow-[0_18px_40px_-16px_rgba(60,99,159,0.20)]"
    >
      {/* Cover + author wrapper. The wrapper is `relative` so the chip
          can be anchored to its bottom edge; the inner aspect div clips
          the cover image. The chip itself lives just outside the cover's
          clipping context so it can poke into the body below. */}
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <CoverPlaceholder seed={post.slug} />
          )}
        </div>

        {author && (
          <div className="pointer-events-none absolute bottom-0 left-5 z-10 translate-y-1/2">
            <AuthorChip author={author} />
          </div>
        )}
      </div>

      {/* Extra top padding leaves room for the overlapping chip */}
      <div className="flex flex-1 flex-col p-6 pt-8">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
          <span>{formatDate(post.createdAt)}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-black/20" />
          <span>{minutes} dk okuma</span>
        </div>

        <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0a0a0a] transition-colors group-hover:text-[#3c639f]">
          {post.title}
        </h3>

        <p className="mt-2.5 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-black/60">
          {excerpt}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3c639f]">
          Yazıyı oku
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </a>
  )
}

// Deterministic placeholder — pick a gradient from a small palette using a
// hash of the post's slug. Same post always gets the same color, so the
// home grid feels intentional instead of random.
function CoverPlaceholder({ seed }: { seed: string }) {
  const palette = [
    "linear-gradient(135deg, #3c639f 0%, #5b8de6 100%)",
    "linear-gradient(135deg, #2f5288 0%, #4285F4 100%)",
    "linear-gradient(135deg, #0866FF 0%, #833AB4 100%)",
    "linear-gradient(135deg, #3c639f 0%, #2f5288 100%)",
    "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const bg = palette[h % palette.length]

  return (
    <div className="relative h-full w-full" style={{ background: bg }}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <BookOpen
        className="absolute right-5 top-5 text-white/40"
        size={22}
        strokeWidth={1.5}
      />
    </div>
  )
}

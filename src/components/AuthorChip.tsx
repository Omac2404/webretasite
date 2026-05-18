import { authorInitials, type Author } from "@/lib/authors-types"

// Round avatar — photo if present, otherwise a brand-gradient circle with
// the author's initials. Used by AuthorChip and the single-post byline.
export function AuthorAvatar({
  author,
  size = 32,
}: {
  author: Author
  size?: number
}) {
  if (author.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.photo}
        alt={author.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #5b8de6 0%, #3c639f 100%)",
      }}
      className="flex shrink-0 items-center justify-center rounded-full text-white"
      aria-hidden
    >
      <span
        className="font-semibold leading-none"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {authorInitials(author.name)}
      </span>
    </div>
  )
}

// Compact author pill — white background, soft shadow, sits on top of
// blog card covers so it's readable regardless of cover artwork.
export function AuthorChip({ author }: { author: Author }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.06] bg-white py-1.5 pl-1.5 pr-3.5 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.20)]">
      <AuthorAvatar author={author} size={28} />
      <div className="leading-tight">
        <div className="text-[12px] font-semibold text-[#0a0a0a]">
          {author.name}
        </div>
        <div className="text-[10.5px] text-black/55">{author.expertise}</div>
      </div>
    </div>
  )
}

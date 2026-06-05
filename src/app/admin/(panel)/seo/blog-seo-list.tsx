import { Check, X, EyeOff, ExternalLink } from "lucide-react"
import type { BlogPost } from "@/lib/blog-types"
import { toggleBlogSitemapAction } from "./actions"

// Read-at-a-glance overview of every published post's sitemap status, with
// a one-click include/exclude toggle. Mirrors what the per-post editor's
// SEO panel controls, surfaced here so the whole blog can be managed from
// one place. A noindex post is never in the sitemap even when "included",
// so we flag that case explicitly rather than showing a misleading state.
export function BlogSeoList({
  posts,
  siteUrl,
}: {
  posts: BlogPost[]
  siteUrl: string
}) {
  const base = (siteUrl || "https://webreta.com.tr").replace(/\/+$/, "")

  if (posts.length === 0) {
    return (
      <p className="text-[13px] text-black/45">
        Henüz yayında blog yazısı yok.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {posts.map((post) => {
        const included = post.seo?.includeInSitemap !== false
        const noindex = post.seo?.noindex === true
        const effectivelyIn = included && !noindex
        return (
          <li
            key={post.id}
            className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#fafbfd] p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13px] font-medium text-[#0a0a0a]">
                  {post.title || "(başlıksız)"}
                </span>
                {noindex && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-amber-700">
                    <EyeOff size={10} />
                    noindex
                  </span>
                )}
              </div>
              <a
                href={`${base}/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[11px] text-black/40 transition-colors hover:text-[#3c639f]"
              >
                /blog/{post.slug}
                <ExternalLink size={10} className="shrink-0" />
              </a>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {effectivelyIn ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-green-700">
                  <Check size={13} /> Sitemap&apos;te
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-black/40">
                  <X size={13} /> Dışarıda
                </span>
              )}

              {/* Toggle — submits the desired next state. Disabled (greyed)
                  when noindex forces the post out regardless. */}
              <form action={toggleBlogSitemapAction}>
                <input type="hidden" name="id" value={post.id} />
                {included ? (
                  <input type="hidden" name="include" value="" />
                ) : (
                  <input type="hidden" name="include" value="on" />
                )}
                <button
                  type="submit"
                  disabled={noindex}
                  title={
                    noindex
                      ? "Yazı noindex — sitemap'e giremez. Önce editörden noindex'i kapat."
                      : included
                        ? "Sitemap'ten çıkar"
                        : "Sitemap'e ekle"
                  }
                  className={
                    noindex
                      ? "cursor-not-allowed rounded-md border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-medium text-black/30"
                      : included
                        ? "rounded-md border border-black/[0.12] bg-white px-3 py-1.5 text-[12px] font-medium text-black/65 transition-colors hover:bg-black/[0.04]"
                        : "rounded-md bg-[#3c639f] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
                  }
                >
                  {included ? "Çıkar" : "Ekle"}
                </button>
              </form>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

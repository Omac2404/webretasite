import { Plus } from "lucide-react"
import { readBlog } from "@/lib/blog-store"
import { listAuthors } from "@/lib/authors-store"
import { readSeo } from "@/lib/seo-store"
import { readMedia } from "@/lib/media-store"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { AddPostForm } from "./add-post-form"
import { AdminPostsList } from "./posts-list"

export const dynamic = "force-dynamic"

export default async function BlogAdminPage() {
  const [{ posts }, authors, seo, { items: media }] = await Promise.all([
    readBlog(),
    listAuthors(),
    readSeo(),
    readMedia(),
  ])
  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Blog
          </h1>
        </div>
        <PreviewLink href="/blog" />
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni yazı
          </div>
        </div>
        <div className="mt-4">
          <AddPostForm
            authors={authors}
            media={media}
            siteUrl={seo.global.siteUrl}
            siteName={seo.global.siteName}
            titleTemplate={seo.global.titleTemplate}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="text-[13px] font-semibold text-[#0a0a0a]">
          Tüm yazılar
        </div>

        {sorted.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yazı yok. Üstteki formla ilk yazını ekle.
          </p>
        ) : (
          <AdminPostsList posts={sorted} />
        )}
      </section>
    </div>
  )
}

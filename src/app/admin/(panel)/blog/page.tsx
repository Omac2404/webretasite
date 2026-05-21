import { Plus } from "lucide-react"
import { readBlog } from "@/lib/blog-store"
import { listAuthors } from "@/lib/authors-store"
import { AddPostForm } from "./add-post-form"
import { AdminPostsList } from "./posts-list"

export const dynamic = "force-dynamic"

export default async function BlogAdminPage() {
  const [{ posts }, authors] = await Promise.all([
    readBlog(),
    listAuthors(),
  ])
  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Blog
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          /blog ve anasayfada görünen yazıları buradan yönet. Yeni yazı ekle,
          mevcutları düzenle, taslağa indir veya sil.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni yazı
          </div>
        </div>
        <div className="mt-4">
          <AddPostForm authors={authors} />
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

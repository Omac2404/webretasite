import Link from "next/link"
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { readBlog } from "@/lib/blog-store"
import { listAuthors } from "@/lib/authors-store"
import { formatDate, type BlogPost } from "@/lib/blog-types"
import { deletePostAction, togglePublishedAction } from "./actions"
import { AddPostForm } from "./add-post-form"

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
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Tüm yazılar
          </div>
          <div className="text-[12px] text-black/50">{sorted.length} kayıt</div>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-4 text-[13px] text-black/45">
            Henüz yazı yok. Üstteki formla ilk yazını ekle.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {sorted.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </ul>
        )}
      </section>
    </div>
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

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getPostById } from "@/lib/blog-store"
import { listAuthors } from "@/lib/authors-store"
import { readSeo } from "@/lib/seo-store"
import { readMedia } from "@/lib/media-store"
import { EditPostForm } from "./edit-post-form"

export const dynamic = "force-dynamic"

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, authors, seo, { items: media }] = await Promise.all([
    getPostById(id),
    listAuthors(),
    readSeo(),
    readMedia(),
  ])
  if (!post) notFound()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <Link
        href="/admin/blog"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-black/55 transition-colors hover:text-[#3c639f]"
      >
        <ArrowLeft size={14} />
        Tüm yazılar
      </Link>

      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Yazıyı düzenle
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Mevcut slug:{" "}
          <span className="font-medium text-[#3c639f]">/blog/{post.slug}</span>
          . Başlığı değiştirirsen slug otomatik güncellenir.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <EditPostForm
          post={post}
          authors={authors}
          media={media}
          siteUrl={seo.global.siteUrl}
          siteName={seo.global.siteName}
          titleTemplate={seo.global.titleTemplate}
        />
      </section>
    </div>
  )
}

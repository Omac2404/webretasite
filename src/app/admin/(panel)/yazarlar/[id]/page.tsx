import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAuthorById } from "@/lib/authors-store"
import { EditAuthorForm } from "./edit-author-form"

export const dynamic = "force-dynamic"

export default async function AuthorEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const author = await getAuthorById(id)
  if (!author) notFound()

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6">
      <Link
        href="/admin/yazarlar"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-black/55 transition-colors hover:text-[#3c639f]"
      >
        <ArrowLeft size={14} />
        Tüm yazarlar
      </Link>

      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Yazarı düzenle
        </h1>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <EditAuthorForm author={author} />
      </section>
    </div>
  )
}

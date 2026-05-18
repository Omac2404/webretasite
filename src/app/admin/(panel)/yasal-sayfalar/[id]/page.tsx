import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getLegalPageById } from "@/lib/legal-store"
import { legalPageHref } from "@/lib/legal-types"
import { EditLegalPageForm } from "./edit-legal-form"

export const dynamic = "force-dynamic"

export default async function LegalPageEdit({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await getLegalPageById(id)
  if (!page) notFound()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <Link
        href="/admin/yasal-sayfalar"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-black/55 transition-colors hover:text-[#3c639f]"
      >
        <ArrowLeft size={14} />
        Tüm yasal sayfalar
      </Link>

      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Sayfayı düzenle
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          URL:{" "}
          <span className="font-medium text-[#3c639f]">
            {legalPageHref(page.slug)}
          </span>
          . Başlığı değiştirirsen URL de güncellenir.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <EditLegalPageForm page={page} />
      </section>
    </div>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getProjectById } from "@/lib/projects-store"
import { readLogos } from "@/lib/logos-store"
import { EditProjectForm } from "./edit-project-form"

export const dynamic = "force-dynamic"

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, { logos }] = await Promise.all([
    getProjectById(id),
    readLogos(),
  ])
  if (!project) notFound()

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
      <Link
        href="/admin/projeler"
        className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-black/55 transition-colors hover:text-[#3c639f]"
      >
        <ArrowLeft size={14} />
        Tüm projeler
      </Link>

      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
          Projeyi düzenle
        </h1>
        <p className="mt-1.5 text-[13.5px] text-black/55">
          Firma, tarih, talep ve çözüm metinlerini istediğin gibi güncelle.
          Kaydedince anasayfaya hemen yansır.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <EditProjectForm project={project} logos={logos} />
      </section>
    </div>
  )
}

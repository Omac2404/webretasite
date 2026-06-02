import { Plus, MessageSquare } from "lucide-react"
import { readProjects } from "@/lib/projects-store"
import { readLogos } from "@/lib/logos-store"
import { DEFAULT_PROJECTS_SIDEBAR } from "@/lib/projects-types"
import { PreviewLink } from "@/components/admin/PreviewLink"
import { AddProjectForm } from "./add-project-form"
import { ProjectsList } from "./projects-list"
import { SidebarForm } from "./sidebar-form"

export const dynamic = "force-dynamic"

export default async function ProjectsAdminPage() {
  const [{ projects, sidebar }, { logos }] = await Promise.all([
    readProjects(),
    readLogos(),
  ])
  const activeSidebar = sidebar ?? DEFAULT_PROJECTS_SIDEBAR
  const logoById = new Map(logos.map((l) => [l.id, l]))
  // Render in stored order — the admin's drag-and-drop drives both this
  // list and the homepage carousel, so sorting by date would fight the
  // user's manual ordering.
  const rows = projects.map((project) => {
    const logo = logoById.get(project.companyId)
    return {
      project,
      logo: logo
        ? { id: logo.id, name: logo.name, imageUrl: logo.imageUrl }
        : undefined,
    }
  })

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            Projeler
          </h1>
        </div>
        <PreviewLink href="/" />
      </div>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Sağ kolon: yaklaşım metni + Teklif al
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-black/50">
          &quot;Neler Yaptık?&quot; bölümünün sağındaki başlık, açıklama ve CTA.
        </p>
        <div className="mt-4">
          <SidebarForm initial={activeSidebar} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center gap-2">
          <Plus size={15} className="text-[#3c639f]" />
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Yeni proje
          </div>
        </div>
        <div className="mt-4">
          <AddProjectForm logos={logos} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[#0a0a0a]">
            Tüm projeler
          </div>
          <div className="text-[12px] text-black/50">{rows.length} kayıt</div>
        </div>

        <ProjectsList initialRows={rows} />
      </section>
    </div>
  )
}

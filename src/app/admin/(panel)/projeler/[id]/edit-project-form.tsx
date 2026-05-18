"use client"

import { useActionState } from "react"
import type { Logo } from "@/lib/logos-store"
import type { Project } from "@/lib/projects-types"
import { updateProjectAction, type EditProjectState } from "../actions"
import { ProjectFormFields } from "../project-form-fields"

const INITIAL: EditProjectState = {}

export function EditProjectForm({
  project,
  logos,
}: {
  project: Project
  logos: Logo[]
}) {
  const [state, formAction, pending] = useActionState(
    updateProjectAction,
    INITIAL,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={project.id} />
      <ProjectFormFields
        logos={logos}
        defaults={{
          companyId: project.companyId,
          category: project.category,
          type: project.type,
          publishDate: project.publishDate,
          demand: project.demand,
          solution: project.solution,
          demandDetail: project.demandDetail,
          solutionDetail: project.solutionDetail,
        }}
        submitting={pending}
        submitLabel="Değişiklikleri kaydet"
        pendingLabel="Kaydediliyor..."
      />
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}
    </form>
  )
}

"use client"

import { useActionState, useEffect, useRef } from "react"
import type { Logo } from "@/lib/logos-store"
import { addProjectAction, type AddProjectState } from "./actions"
import { ProjectFormFields } from "./project-form-fields"

const INITIAL: AddProjectState = {}

export function AddProjectForm({ logos }: { logos: Logo[] }) {
  const [state, formAction, pending] = useActionState(
    addProjectAction,
    INITIAL,
  )
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the form after a successful submit so the admin can quickly
  // add another project without manually clearing each field.
  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <ProjectFormFields
        logos={logos}
        submitting={pending}
        submitLabel="Projeyi ekle"
        pendingLabel="Ekleniyor..."
      />
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}
    </form>
  )
}

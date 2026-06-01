"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { GripVertical, Loader2, Pencil, Trash2 } from "lucide-react"
import {
  categoryLabel,
  deriveInitials,
  formatPublishDate,
  type Project,
} from "@/lib/projects-types"
import { deleteProjectAction, reorderProjectsAction } from "./actions"

// Lightweight referans shape — we only need the bits used in the row.
export type ProjectLogoInfo = {
  id: string
  name: string
  imageUrl: string
}

type Row = {
  project: Project
  logo: ProjectLogoInfo | undefined
}

// Sürükle-bırak liste. HTML5 native DnD — tek bir dış kütüphane bile
// eklemiyoruz. Drop anında diziyi yerelde yeniden sıralıyor, ardından
// yeni sıralamayı server action'a gönderip kalıcı hale getiriyoruz. Bu
// arada başka biri sayfayı görüntülerse stored order ile API order eşit
// kalır (homepage karusele de aynı sırayla geliyor).
export function ProjectsList({
  initialRows,
}: {
  initialRows: Row[]
}) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Sync local state with server-rendered initialRows whenever they
  // change (e.g. after a delete/add server action revalidates the page).
  // Without this, useState keeps its first value and the row the user
  // just deleted stays visible — making it look like delete is broken.
  useEffect(() => {
    setRows(initialRows)
  }, [initialRows])

  function handleDragStart(id: string, e: React.DragEvent<HTMLLIElement>) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = "move"
    // Firefox needs a data payload to actually fire drop events.
    e.dataTransfer.setData("text/plain", id)
  }

  function handleDragOver(id: string, e: React.DragEvent<HTMLLIElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (id !== overId) setOverId(id)
  }

  function handleDragLeave(id: string) {
    if (id === overId) setOverId(null)
  }

  function handleDrop(targetId: string, e: React.DragEvent<HTMLLIElement>) {
    e.preventDefault()
    const sourceId = draggingId
    setDraggingId(null)
    setOverId(null)
    if (!sourceId || sourceId === targetId) return

    const next = [...rows]
    const sourceIdx = next.findIndex((r) => r.project.id === sourceId)
    const targetIdx = next.findIndex((r) => r.project.id === targetId)
    if (sourceIdx < 0 || targetIdx < 0) return
    const [moved] = next.splice(sourceIdx, 1)
    next.splice(targetIdx, 0, moved)
    setRows(next)

    const ids = next.map((r) => r.project.id)
    startTransition(() => {
      reorderProjectsAction(ids).catch(() => {
        // Roll back to the server-rendered order if the action fails so
        // the admin sees the truth instead of a stale optimistic state.
        setRows(initialRows)
      })
    })
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverId(null)
  }

  if (rows.length === 0) {
    return (
      <p className="mt-4 text-[13px] text-black/45">
        Henüz proje yok. Üstteki formla ilk projeni ekle.
      </p>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11.5px] text-black/40">
        <span>
          Satırları sürükleyip bırakarak sıralamayı değiştirebilirsin —
          anasayfadaki şerit de aynı sırada akar.
        </span>
        {pending && (
          <span className="inline-flex items-center gap-1 text-[#3c639f]">
            <Loader2 size={12} className="animate-spin" />
            Kaydediliyor...
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map(({ project, logo }) => {
          const isDragging = draggingId === project.id
          const isOver = overId === project.id && draggingId !== project.id
          return (
            <li
              key={project.id}
              draggable
              onDragStart={(e) => handleDragStart(project.id, e)}
              onDragOver={(e) => handleDragOver(project.id, e)}
              onDragLeave={() => handleDragLeave(project.id)}
              onDrop={(e) => handleDrop(project.id, e)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-xl border bg-[#fafbfd] p-3 transition-colors ${
                isOver
                  ? "border-[#3c639f]/40 bg-[#3c639f]/[0.04]"
                  : "border-black/[0.06]"
              }`}
              style={{
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
              }}
            >
              <GripVertical
                size={16}
                className="shrink-0 text-black/30"
                aria-hidden
              />

              <ProjectRowContent project={project} logo={logo} />

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/projeler/${project.id}`}
                  aria-label="Düzenle"
                  title="Düzenle"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#0a0a0a]"
                  draggable={false}
                >
                  <Pencil size={14} />
                </Link>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={project.id} />
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
        })}
      </ul>
    </div>
  )
}

function ProjectRowContent({
  project,
  logo,
}: {
  project: Project
  logo: ProjectLogoInfo | undefined
}) {
  const companyName = logo?.name ?? "Bilinmeyen firma"
  return (
    <>
      <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/[0.06] bg-white">
        {logo?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.imageUrl}
            alt={companyName}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-[13px] font-bold tracking-tight text-[#3c639f]">
            {deriveInitials(companyName)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-[#0a0a0a]">
            {companyName}
          </span>
          <span className="shrink-0 rounded-full bg-[#3c639f]/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#3c639f]">
            {project.type}
          </span>
          {!logo && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-amber-800">
              Eksik firma
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-black/40">
          <span>{categoryLabel(project.category)}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-black/15" />
          <span>{formatPublishDate(project.publishDate)}</span>
        </div>
        <div className="mt-1 truncate text-[11.5px] text-black/55">
          {project.demand}
        </div>
      </div>
    </>
  )
}

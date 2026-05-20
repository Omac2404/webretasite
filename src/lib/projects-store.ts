// Server-only: imports node:fs. Do not import from client components —
// pull the types from `./projects-types` instead. Mirrors logos-store
// and blog-store: JSON file on disk, swap for Postgres later via the
// same interface.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DEFAULT_PROJECTS_SIDEBAR,
  type Project,
  type ProjectCategory,
  type ProjectsData,
  type ProjectsSidebar,
} from "./projects-types"

const DATA_FILE = path.join(process.cwd(), "data", "projects.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeCategory(v: unknown): ProjectCategory {
  return v === "ops" ? "ops" : "dev"
}

function normalizeProject(p: Partial<Project>): Project {
  const now = new Date().toISOString()
  return {
    id: String(p.id ?? makeId()),
    companyId: String(p.companyId ?? ""),
    category: normalizeCategory(p.category),
    type: String(p.type ?? ""),
    publishDate: String(p.publishDate ?? ""),
    demand: String(p.demand ?? ""),
    solution: String(p.solution ?? ""),
    demandDetail: String(p.demandDetail ?? ""),
    solutionDetail: String(p.solutionDetail ?? ""),
    createdAt: String(p.createdAt ?? now),
    updatedAt: String(p.updatedAt ?? now),
  }
}

function normalizeSidebar(input: unknown): ProjectsSidebar {
  const raw = (input ?? {}) as Partial<ProjectsSidebar>
  const pick = (v: unknown, fallback: string): string =>
    typeof v === "string" && v.trim() ? v.trim() : fallback
  return {
    titleLeading: pick(raw.titleLeading, DEFAULT_PROJECTS_SIDEBAR.titleLeading),
    titleHighlight: pick(
      raw.titleHighlight,
      DEFAULT_PROJECTS_SIDEBAR.titleHighlight,
    ),
    description: pick(raw.description, DEFAULT_PROJECTS_SIDEBAR.description),
    ctaLabel: pick(raw.ctaLabel, DEFAULT_PROJECTS_SIDEBAR.ctaLabel),
    ctaHref: pick(raw.ctaHref, DEFAULT_PROJECTS_SIDEBAR.ctaHref),
  }
}

export async function readProjects(): Promise<ProjectsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<ProjectsData> & {
      projects?: Array<Partial<Project>>
    }
    const projects = Array.isArray(parsed.projects)
      ? parsed.projects.map(normalizeProject)
      : []
    const sidebar = normalizeSidebar(parsed.sidebar)
    return { projects, sidebar }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { projects: [], sidebar: { ...DEFAULT_PROJECTS_SIDEBAR } }
    }
    throw err
  }
}

async function writeProjects(data: ProjectsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function getProjectById(id: string): Promise<Project | null> {
  const data = await readProjects()
  return data.projects.find((p) => p.id === id) ?? null
}

export async function addProject(input: {
  companyId: string
  category: ProjectCategory
  type: string
  publishDate: string
  demand: string
  solution: string
  demandDetail: string
  solutionDetail: string
}): Promise<Project> {
  const data = await readProjects()
  const now = new Date().toISOString()
  const project: Project = {
    id: makeId(),
    companyId: input.companyId,
    category: input.category,
    type: input.type,
    publishDate: input.publishDate,
    demand: input.demand,
    solution: input.solution,
    demandDetail: input.demandDetail,
    solutionDetail: input.solutionDetail,
    createdAt: now,
    updatedAt: now,
  }
  data.projects.unshift(project)
  await writeProjects(data)
  return project
}

export async function updateProject(
  id: string,
  input: {
    companyId: string
    category: ProjectCategory
    type: string
    publishDate: string
    demand: string
    solution: string
    demandDetail: string
    solutionDetail: string
  },
): Promise<void> {
  const data = await readProjects()
  const project = data.projects.find((p) => p.id === id)
  if (!project) return
  project.companyId = input.companyId
  project.category = input.category
  project.type = input.type
  project.publishDate = input.publishDate
  project.demand = input.demand
  project.solution = input.solution
  project.demandDetail = input.demandDetail
  project.solutionDetail = input.solutionDetail
  project.updatedAt = new Date().toISOString()
  await writeProjects(data)
}

export async function deleteProject(id: string): Promise<void> {
  const data = await readProjects()
  data.projects = data.projects.filter((p) => p.id !== id)
  await writeProjects(data)
}

export async function updateProjectsSidebar(
  patch: Partial<ProjectsSidebar>,
): Promise<void> {
  const data = await readProjects()
  data.sidebar = normalizeSidebar({ ...(data.sidebar ?? {}), ...patch })
  await writeProjects(data)
}

// Persist a new ordering for the project list. The admin's drag-and-drop
// sends the full list of IDs in the desired order; we reorder our stored
// array to match and silently drop unknown IDs. Any projects the caller
// didn't include (race with a concurrent add) are appended at the end so
// nothing is lost.
export async function setProjectsOrder(ids: string[]): Promise<void> {
  const data = await readProjects()
  const byId = new Map(data.projects.map((p) => [p.id, p]))
  const reordered: Project[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    const p = byId.get(id)
    if (p && !seen.has(id)) {
      reordered.push(p)
      seen.add(id)
    }
  }
  for (const p of data.projects) {
    if (!seen.has(p.id)) reordered.push(p)
  }
  data.projects = reordered
  await writeProjects(data)
}

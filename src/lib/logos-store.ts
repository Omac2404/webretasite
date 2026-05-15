// File-based store for the partner logo marquee. JSON on disk so the
// admin can curate the list without a database — we'll migrate this to
// Postgres when the rest of the panel needs it. Server-only: relies on
// node:fs and must never be imported from a client component.

import { promises as fs } from "node:fs"
import path from "node:path"

export type LogoDisplayMode = "logos" | "names"

// Marquee has two tracks: row "a" is the fast top row, row "b" is the
// slower bottom row. Stored on each logo so the admin can assign them
// individually and reorder within a row.
export type LogoRow = "a" | "b"

export type Logo = {
  id: string
  name: string
  // Empty string means "no image uploaded yet" — in logos mode we fall
  // back to rendering the name so the row never has gaps.
  imageUrl: string
  row: LogoRow
}

export type LogosData = {
  mode: LogoDisplayMode
  logos: Logo[]
}

const DATA_FILE = path.join(process.cwd(), "data", "logos.json")

const EMPTY: LogosData = { mode: "names", logos: [] }

function normalizeRow(value: unknown): LogoRow {
  return value === "b" ? "b" : "a"
}

export async function readLogos(): Promise<LogosData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<LogosData> & {
      logos?: Array<Partial<Logo>>
    }
    return {
      mode: parsed.mode === "logos" ? "logos" : "names",
      logos: Array.isArray(parsed.logos)
        ? parsed.logos.map((l) => ({
            id: String(l.id ?? ""),
            name: String(l.name ?? ""),
            imageUrl: String(l.imageUrl ?? ""),
            row: normalizeRow(l.row),
          }))
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return EMPTY
    throw err
  }
}

async function writeLogos(data: LogosData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function addLogo(input: {
  name: string
  imageUrl: string
  row: LogoRow
}): Promise<Logo> {
  const data = await readLogos()
  const logo: Logo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    imageUrl: input.imageUrl,
    row: input.row,
  }
  data.logos.push(logo)
  await writeLogos(data)
  return logo
}

export async function deleteLogo(id: string): Promise<void> {
  const data = await readLogos()
  data.logos = data.logos.filter((l) => l.id !== id)
  await writeLogos(data)
}

export async function setDisplayMode(mode: LogoDisplayMode): Promise<void> {
  const data = await readLogos()
  data.mode = mode
  await writeLogos(data)
}

// Move a logo up or down within its own row. We find the target logo's
// position in the full array, scan in the requested direction for the
// nearest sibling that shares its row, and swap the two entries. This
// keeps a single ordered array as the source of truth while letting
// rows reorder independently.
export async function moveLogo(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const data = await readLogos()
  const idx = data.logos.findIndex((l) => l.id === id)
  if (idx < 0) return
  const row = data.logos[idx].row
  const step = direction === "up" ? -1 : 1
  let neighbor = idx + step
  while (
    neighbor >= 0 &&
    neighbor < data.logos.length &&
    data.logos[neighbor].row !== row
  ) {
    neighbor += step
  }
  if (neighbor < 0 || neighbor >= data.logos.length) return
  const tmp = data.logos[idx]
  data.logos[idx] = data.logos[neighbor]
  data.logos[neighbor] = tmp
  await writeLogos(data)
}

// Swap a logo's row (a → b or b → a). The entry stays at its position
// in the array; the marquee filters by row so this is enough.
export async function swapLogoRow(id: string): Promise<void> {
  const data = await readLogos()
  const logo = data.logos.find((l) => l.id === id)
  if (!logo) return
  logo.row = logo.row === "a" ? "b" : "a"
  await writeLogos(data)
}

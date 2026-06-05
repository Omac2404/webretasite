// File-based registry for the media library. Each entry points at a file
// under /public/media plus SEO metadata (alt text) and dimensions. The
// "Görseller" admin tab and the reusable media picker read/write this.
//
// Server-only: relies on node:fs.

import { promises as fs } from "node:fs"
import path from "node:path"

export type MediaItem = {
  id: string
  url: string // public path, e.g. /media/izmir-web-tasarim-ab12.webp
  alt: string // SEO/accessibility alt text — editable
  width: number | null
  height: number | null
  size: number // bytes
  originalName: string
  createdAt: string // ISO
}

export type MediaData = { items: MediaItem[] }

const DATA_FILE = path.join(process.cwd(), "data", "media.json")
const MEDIA_DIR = path.join(process.cwd(), "public", "media")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeItem(raw: Partial<MediaItem>): MediaItem {
  return {
    id: String(raw.id ?? makeId()),
    url: String(raw.url ?? ""),
    alt: typeof raw.alt === "string" ? raw.alt : "",
    width: typeof raw.width === "number" ? raw.width : null,
    height: typeof raw.height === "number" ? raw.height : null,
    size: typeof raw.size === "number" ? raw.size : 0,
    originalName: String(raw.originalName ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  }
}

export async function readMedia(): Promise<MediaData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<MediaData>
    return {
      items: Array.isArray(parsed.items) ? parsed.items.map(normalizeItem) : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { items: [] }
    throw err
  }
}

let writeQueue: Promise<unknown> = Promise.resolve()

async function writeMedia(data: MediaData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function enqueue<T>(work: (data: MediaData) => Promise<T> | T): Promise<T> {
  const task = writeQueue.then(async () => {
    const data = await readMedia()
    const result = await work(data)
    await writeMedia(data)
    return result
  })
  writeQueue = task.catch(() => undefined)
  return task
}

export const MEDIA_PUBLIC_DIR = MEDIA_DIR

// Write the already-processed bytes to /public/media under a unique,
// slug-based filename and register the entry. Returns the new item.
export async function addMediaFile(input: {
  data: Buffer
  ext: string
  baseSlug: string
  alt: string
  width: number | null
  height: number | null
  size: number
  originalName: string
}): Promise<MediaItem> {
  await fs.mkdir(MEDIA_DIR, { recursive: true })
  const filename = `${input.baseSlug}-${Math.random().toString(36).slice(2, 6)}.${input.ext}`
  await fs.writeFile(path.join(MEDIA_DIR, filename), input.data)

  const item = normalizeItem({
    id: makeId(),
    url: `/media/${filename}`,
    alt: input.alt,
    width: input.width,
    height: input.height,
    size: input.size,
    originalName: input.originalName,
    createdAt: new Date().toISOString(),
  })
  return enqueue((data) => {
    data.items.unshift(item)
    return item
  })
}

export async function deleteMedia(id: string): Promise<void> {
  const removed = await enqueue((data) => {
    const item = data.items.find((i) => i.id === id) ?? null
    data.items = data.items.filter((i) => i.id !== id)
    return item
  })
  // Best-effort unlink of the physical file after the record is gone.
  if (removed?.url?.startsWith("/media/")) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", removed.url))
    } catch {
      // already gone — ignore
    }
  }
}

export async function updateMediaAlt(id: string, alt: string): Promise<void> {
  await enqueue((data) => {
    const item = data.items.find((i) => i.id === id)
    if (item) item.alt = alt
  })
}

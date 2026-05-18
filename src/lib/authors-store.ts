// Server-only authors store. Import types from `./authors-types` in
// client components.

import { promises as fs } from "node:fs"
import path from "node:path"
import { type Author, type AuthorsData } from "./authors-types"

const DATA_FILE = path.join(process.cwd(), "data", "authors.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(a: Partial<Author>): Author {
  return {
    id: String(a.id ?? makeId()),
    name: String(a.name ?? "").trim(),
    expertise: String(a.expertise ?? "").trim(),
    photo: String(a.photo ?? ""),
  }
}

export async function readAuthors(): Promise<AuthorsData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<AuthorsData> & {
      authors?: Array<Partial<Author>>
    }
    return {
      authors: Array.isArray(parsed.authors)
        ? parsed.authors.map(normalize)
        : [],
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { authors: [] }
    throw err
  }
}

async function writeAuthors(data: AuthorsData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function listAuthors(): Promise<Author[]> {
  const { authors } = await readAuthors()
  return [...authors].sort((a, b) => a.name.localeCompare(b.name, "tr"))
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const { authors } = await readAuthors()
  return authors.find((a) => a.id === id) ?? null
}

export async function addAuthor(input: {
  name: string
  expertise: string
  photo: string
}): Promise<Author> {
  const data = await readAuthors()
  const author: Author = {
    id: makeId(),
    name: input.name,
    expertise: input.expertise,
    photo: input.photo,
  }
  data.authors.push(author)
  await writeAuthors(data)
  return author
}

export async function updateAuthor(
  id: string,
  input: { name: string; expertise: string; photo?: string },
): Promise<void> {
  const data = await readAuthors()
  const author = data.authors.find((a) => a.id === id)
  if (!author) return
  author.name = input.name
  author.expertise = input.expertise
  if (typeof input.photo === "string") author.photo = input.photo
  await writeAuthors(data)
}

export async function deleteAuthor(id: string): Promise<void> {
  const data = await readAuthors()
  data.authors = data.authors.filter((a) => a.id !== id)
  await writeAuthors(data)
}

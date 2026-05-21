// Server-only: imports node:fs. Do not import from client components —
// pull the types from `./blog-types` instead.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  slugify as slugifyShared,
  type BlogData,
  type BlogPost,
  type BlogPostSeo,
  type CategoryKey,
} from "./blog-types"

function normalizeSeo(input: unknown): BlogPostSeo | undefined {
  if (input == null) return undefined
  const raw = input as Partial<BlogPostSeo>
  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords
        .map((k) => String(k).trim())
        .filter((k) => k.length > 0)
        .slice(0, 20)
    : []
  const seo: BlogPostSeo = {
    metaTitle: typeof raw.metaTitle === "string" ? raw.metaTitle.trim() : "",
    metaDescription:
      typeof raw.metaDescription === "string"
        ? raw.metaDescription.trim()
        : "",
    keywords,
    focusKeyword:
      typeof raw.focusKeyword === "string" ? raw.focusKeyword.trim() : "",
    ogImage: typeof raw.ogImage === "string" ? raw.ogImage.trim() : "",
    noindex: raw.noindex === true,
    includeInSitemap: raw.includeInSitemap !== false,
  }
  // Don't persist an entirely empty SEO blob — keeps JSON tidy
  const hasAny =
    seo.metaTitle ||
    seo.metaDescription ||
    seo.keywords.length > 0 ||
    seo.focusKeyword ||
    seo.ogImage ||
    seo.noindex ||
    seo.includeInSitemap === false
  return hasAny ? seo : undefined
}

function normalizeCategory(v: unknown): CategoryKey {
  return v === "haberler" ? "haberler" : "teknik"
}

const DATA_FILE = path.join(process.cwd(), "data", "blog.json")

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Re-export the shared slugifier so existing imports from blog-store
// keep working.
export const slugify = slugifyShared

function normalizePost(p: Partial<BlogPost>): BlogPost {
  const now = new Date().toISOString()
  const seo = normalizeSeo(p.seo)
  return {
    id: String(p.id ?? makeId()),
    authorId: String(p.authorId ?? ""),
    category: normalizeCategory(p.category),
    slug: String(p.slug ?? slugify(String(p.title ?? "yazi"))),
    title: String(p.title ?? ""),
    excerpt: String(p.excerpt ?? ""),
    content: String(p.content ?? ""),
    coverImage: String(p.coverImage ?? ""),
    createdAt: String(p.createdAt ?? now),
    updatedAt: String(p.updatedAt ?? now),
    published: p.published !== false,
    ...(seo ? { seo } : {}),
  }
}

export async function readBlog(): Promise<BlogData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw) as Partial<BlogData> & {
      posts?: Array<Partial<BlogPost>>
    }
    const posts = Array.isArray(parsed.posts)
      ? parsed.posts.map(normalizePost)
      : []
    return { posts }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { posts: [] }
    throw err
  }
}

async function writeBlog(data: BlogData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

// Published posts, newest first. Used by the public blog index, the home
// page section, and the single-post sibling links.
export async function listPublished(): Promise<BlogPost[]> {
  const data = await readBlog()
  return data.posts
    .filter((p) => p.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const data = await readBlog()
  return data.posts.find((p) => p.slug === slug && p.published) ?? null
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const data = await readBlog()
  return data.posts.find((p) => p.id === id) ?? null
}

// Make sure the new slug doesn't collide with another post. If it does,
// append a short suffix until it's unique. `excludeId` lets edits keep
// the same slug.
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const data = await readBlog()
  const taken = new Set(
    data.posts.filter((p) => p.id !== excludeId).map((p) => p.slug),
  )
  if (!taken.has(base)) return base
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}

export async function addPost(input: {
  authorId: string
  category: CategoryKey
  title: string
  excerpt: string
  content: string
  coverImage: string
  published: boolean
  seo?: Partial<BlogPostSeo>
}): Promise<BlogPost> {
  const data = await readBlog()
  const slug = await uniqueSlug(slugify(input.title))
  const now = new Date().toISOString()
  const seo = normalizeSeo(input.seo)
  const post: BlogPost = {
    id: makeId(),
    authorId: input.authorId,
    category: input.category,
    slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content.replace(/\r\n/g, "\n"),
    coverImage: input.coverImage,
    createdAt: now,
    updatedAt: now,
    published: input.published,
    ...(seo ? { seo } : {}),
  }
  data.posts.unshift(post)
  await writeBlog(data)
  return post
}

export async function updatePost(
  id: string,
  input: {
    authorId: string
    category: CategoryKey
    title: string
    excerpt: string
    content: string
    coverImage?: string
    published: boolean
    seo?: Partial<BlogPostSeo>
  },
): Promise<void> {
  const data = await readBlog()
  const post = data.posts.find((p) => p.id === id)
  if (!post) return
  // Re-slugify only if the title changed — keeps existing URLs stable
  // when the admin only edits body text.
  if (post.title !== input.title) {
    post.slug = await uniqueSlug(slugify(input.title), id)
  }
  post.authorId = input.authorId
  post.category = input.category
  post.title = input.title
  post.excerpt = input.excerpt
  post.content = input.content.replace(/\r\n/g, "\n")
  if (typeof input.coverImage === "string") post.coverImage = input.coverImage
  post.published = input.published
  const seo = normalizeSeo(input.seo)
  if (seo) post.seo = seo
  else delete post.seo
  post.updatedAt = new Date().toISOString()
  await writeBlog(data)
}

export async function deletePost(id: string): Promise<void> {
  const data = await readBlog()
  data.posts = data.posts.filter((p) => p.id !== id)
  await writeBlog(data)
}

export async function togglePublished(id: string): Promise<void> {
  const data = await readBlog()
  const post = data.posts.find((p) => p.id === id)
  if (!post) return
  post.published = !post.published
  post.updatedAt = new Date().toISOString()
  await writeBlog(data)
}

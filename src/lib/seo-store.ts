// File-based store for site-wide SEO. Server-only — imports node:fs.
// Types live in ./seo-types so client components can share them.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  CHANGE_FREQS,
  SEO_MANAGED_PAGES,
  type ChangeFreq,
  type GlobalSeo,
  type PageSeo,
  type SeoData,
} from "./seo-types"

const DATA_FILE = path.join(process.cwd(), "data", "seo.json")

const DEFAULT_GLOBAL: GlobalSeo = {
  siteName: "Webreta",
  siteUrl: "https://webreta.com.tr",
  defaultTitle: "Webreta | İzmir Web Tasarım ve Geliştirme Ajansı",
  titleTemplate: "%s | Webreta",
  defaultDescription:
    "Markanıza özel, hızlı ve modern web siteleri. İzmir merkezli web geliştirme ajansı.",
  defaultKeywords: [
    "web tasarım",
    "web geliştirme",
    "İzmir",
    "web ajansı",
    "kurumsal web sitesi",
  ],
  defaultOgImage: "",
  twitterHandle: "",
}

function defaultPage(): PageSeo {
  return {
    title: "",
    description: "",
    keywords: [],
    ogImage: "",
    noindex: false,
    includeInSitemap: true,
    priority: 0.7,
    changefreq: "weekly",
  }
}

function defaultPages(): Record<string, PageSeo> {
  const out: Record<string, PageSeo> = {}
  for (const p of SEO_MANAGED_PAGES) {
    out[p.href] = {
      ...defaultPage(),
      priority: p.href === "/" ? 1 : 0.7,
    }
  }
  return out
}

const SEED: SeoData = {
  global: DEFAULT_GLOBAL,
  pages: defaultPages(),
  sitemap: {
    includeLegalPages: false,
    extraUrls: [],
  },
}

function pickStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback
}

function pickBool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v
  return fallback
}

function pickKeywords(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((k) => String(k).trim())
    .filter((k) => k.length > 0)
    .slice(0, 20)
}

function pickPriority(v: unknown, fallback = 0.7): number {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(1, Math.max(0, n))
}

function pickChangeFreq(v: unknown, fallback: ChangeFreq = "weekly"): ChangeFreq {
  return typeof v === "string" && (CHANGE_FREQS as string[]).includes(v)
    ? (v as ChangeFreq)
    : fallback
}

function normalizeGlobal(input: unknown): GlobalSeo {
  const raw = (input ?? {}) as Partial<GlobalSeo>
  return {
    siteName: pickStr(raw.siteName, DEFAULT_GLOBAL.siteName),
    siteUrl: pickStr(raw.siteUrl, DEFAULT_GLOBAL.siteUrl).replace(/\/+$/, ""),
    defaultTitle: pickStr(raw.defaultTitle, DEFAULT_GLOBAL.defaultTitle),
    titleTemplate: pickStr(raw.titleTemplate, DEFAULT_GLOBAL.titleTemplate),
    defaultDescription: pickStr(
      raw.defaultDescription,
      DEFAULT_GLOBAL.defaultDescription,
    ),
    defaultKeywords: pickKeywords(raw.defaultKeywords),
    defaultOgImage: pickStr(raw.defaultOgImage),
    twitterHandle: pickStr(raw.twitterHandle),
  }
}

function normalizePage(input: unknown): PageSeo {
  const raw = (input ?? {}) as Partial<PageSeo>
  return {
    title: pickStr(raw.title),
    description: pickStr(raw.description),
    keywords: pickKeywords(raw.keywords),
    ogImage: pickStr(raw.ogImage),
    noindex: pickBool(raw.noindex, false),
    includeInSitemap: pickBool(raw.includeInSitemap, true),
    priority: pickPriority(raw.priority),
    changefreq: pickChangeFreq(raw.changefreq),
  }
}

function normalize(input: unknown): SeoData {
  const obj = (input ?? {}) as Partial<SeoData>
  const pages: Record<string, PageSeo> = {}
  for (const p of SEO_MANAGED_PAGES) {
    pages[p.href] = normalizePage(obj.pages?.[p.href])
  }
  const sitemap = (obj.sitemap ?? {}) as Partial<SeoData["sitemap"]>
  const extra = Array.isArray(sitemap.extraUrls)
    ? sitemap.extraUrls
        .map((u) => String(u).trim())
        .filter((u) => u.startsWith("/") || u.startsWith("http"))
        .slice(0, 50)
    : []
  return {
    global: normalizeGlobal(obj.global),
    pages,
    sitemap: {
      includeLegalPages: pickBool(sitemap.includeLegalPages, false),
      extraUrls: extra,
    },
  }
}

export async function readSeo(): Promise<SeoData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return SEED
    throw err
  }
}

export async function writeSeo(data: SeoData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function getPageSeo(href: string): Promise<PageSeo> {
  const data = await readSeo()
  return data.pages[href] ?? normalizePage(undefined)
}

export async function updateGlobalSeo(patch: Partial<GlobalSeo>): Promise<void> {
  const current = await readSeo()
  await writeSeo({
    ...current,
    global: normalizeGlobal({ ...current.global, ...patch }),
  })
}

export async function updatePageSeo(
  href: string,
  patch: Partial<PageSeo>,
): Promise<void> {
  const current = await readSeo()
  const merged = normalizePage({ ...current.pages[href], ...patch })
  await writeSeo({
    ...current,
    pages: { ...current.pages, [href]: merged },
  })
}

export async function updateSitemapSettings(
  patch: Partial<SeoData["sitemap"]>,
): Promise<void> {
  const current = await readSeo()
  const next = {
    includeLegalPages: pickBool(
      patch.includeLegalPages ?? current.sitemap.includeLegalPages,
      false,
    ),
    extraUrls: Array.isArray(patch.extraUrls)
      ? patch.extraUrls
          .map((u) => String(u).trim())
          .filter((u) => u.startsWith("/") || u.startsWith("http"))
          .slice(0, 50)
      : current.sitemap.extraUrls,
  }
  await writeSeo({ ...current, sitemap: next })
}

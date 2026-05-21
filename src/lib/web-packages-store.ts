// File-based store for the web-site quote wizard package picker. Same
// JSON-on-disk pattern as the other stores. Server-only.

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  MAX_KOBI_BULLETS,
  MAX_KOBI_TAGS,
  MAX_WEB_PACKAGE_BULLETS,
  WEB_PACKAGE_ICON_KEYS,
  type KobiBanner,
  type WebPackage,
  type WebPackageIconKey,
  type WebPackagesData,
  type WizardHeading,
} from "./web-packages-types"

export type {
  KobiBanner,
  WebPackage,
  WebPackageIconKey,
  WebPackagesData,
  WizardHeading,
}
export {
  MAX_KOBI_BULLETS,
  MAX_KOBI_TAGS,
  MAX_WEB_PACKAGE_BULLETS,
  WEB_PACKAGE_ICON_KEYS,
}

const DEFAULT_WIZARD_HEADING: WizardHeading = {
  titleLeader: "Projenize özel",
  titleHighlight: "fiyat teklifi",
  subtitle:
    "Dört kısa adımda projenizi tanıyalım. Cevaplarınıza göre size en uygun çözümü ve net bir fiyat aralığını sunalım.",
}

const DEFAULT_KOBI_BANNER: KobiBanner = {
  imageUrl: "",
  eyebrow: "Webreta'dan",
  bigTitle: "KOBİ",
  bigSubtitle: "Küçük & Orta Ölçek",
  tags: ["Hızlı kurulum", "Sabit fiyat", "Sade panel"],
  rightEyebrow: "Aradığınız bu olabilir",
  title: "KOBİ'niz için hızlı ve bütçe dostu web sitesi",
  description:
    "Küçük ve orta ölçekli işletmeler için tasarladığımız Webreta KOBİ, kurumsal kimlik, içerik yönetimi ve mobil uyumlu modern bir tasarımı sabit fiyat ve hızlı teslimat sözüyle birleştiriyor. Karmaşaya girmeden, ihtiyacınız olan her şey: tek pakette.",
  bullets: [
    "2–3 hafta içinde yayında",
    "Sabit fiyat, sürpriz yok",
    "Sade içerik yönetim paneli",
    "Mobil + masaüstü uyumlu",
  ],
  ctaLabel: "Webreta KOBİ'yi keşfet",
  ctaHref: "https://kobi.webreta.com",
}

const DATA_FILE = path.join(process.cwd(), "data", "web-packages.json")

const SEED: WebPackagesData = {
  kobiBanner: DEFAULT_KOBI_BANNER,
  wizardHeading: DEFAULT_WIZARD_HEADING,
  packages: [
    {
      id: "landing",
      label: "Landing Sayfa",
      tagline: "Tek sayfa · dönüşüm odaklı",
      descriptor: "Pratik",
      desc: "Tek sayfada hikayenizi anlatan, dönüşüm odaklı tasarım. Ürün lansmanları, kampanyalar veya tek bir hizmete odaklanan işletmeler için ideal.",
      bullets: ["1 sayfa", "Form ve CTA optimizasyonu", "Hızlı yayına alma"],
      iconKey: "layers",
      kobiRedirect: true,
    },
    {
      id: "mini",
      label: "Kompakt Kurumsal Site",
      tagline: "5 sayfaya kadar · statik",
      descriptor: "Bütçe dostu",
      desc: "5 sayfaya kadar statik kurumsal site. Hakkımızda, hizmetler, referanslar ve iletişim — hızlı yüklenen, şık bir dijital vitrin.",
      bullets: ["5 sayfaya kadar", "Mobil + masaüstü uyumlu", "Temel SEO"],
      iconKey: "globe",
      kobiRedirect: true,
    },
    {
      id: "pro",
      label: "Profesyonel Kurumsal Site",
      tagline: "50 sayfaya kadar · CMS",
      descriptor: "İdeal",
      desc: "50 sayfaya kadar genişleyebilen, blog modülü, içerik yönetim paneli ve gelişmiş form yönetimi içeren tam donanımlı kurumsal site.",
      bullets: [
        "50 sayfaya kadar",
        "İçerik yönetim paneli (CMS)",
        "Blog + gelişmiş form yönetimi",
      ],
      iconKey: "boxes",
      kobiRedirect: false,
    },
    {
      id: "webapp",
      label: "Web Uygulamalı Kurumsal Site",
      tagline: "Sınırsız ölçek · amaca özel uygulama",
      descriptor: "Profesyonel",
      desc: "Sektörünüze özel iş akışlarını dijitalleştiren güçlü uygulamalar: online randevu, sipariş takip, müşteri/hasta portalı, lojistik ve stok yönetimi gibi sınırsız özelleştirilebilir çözümler.",
      bullets: [
        "Online randevu / rezervasyon",
        "Sipariş, hasta veya müşteri takip paneli",
        "Sektörünüze özel iş akışı tasarımı",
      ],
      iconKey: "rocket",
      kobiRedirect: false,
    },
  ],
}

function clamp<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(0, max) : arr
}

function isIconKey(v: unknown): v is WebPackageIconKey {
  return typeof v === "string" && (WEB_PACKAGE_ICON_KEYS as string[]).includes(v)
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "paket"
  )
}

function normalizeKobi(input: unknown): KobiBanner {
  const raw = (input ?? {}) as Partial<KobiBanner>
  const pickStr = (v: unknown, fallback: string): string =>
    typeof v === "string" && v.trim() ? v.trim() : fallback
  const tags = Array.isArray(raw.tags)
    ? clamp(
        (raw.tags as unknown[]).map((t) => String(t).trim()).filter((t) => t.length > 0),
        MAX_KOBI_TAGS,
      )
    : DEFAULT_KOBI_BANNER.tags
  const bullets = Array.isArray(raw.bullets)
    ? clamp(
        (raw.bullets as unknown[])
          .map((b) => String(b).trim())
          .filter((b) => b.length > 0),
        MAX_KOBI_BULLETS,
      )
    : DEFAULT_KOBI_BANNER.bullets
  return {
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "",
    eyebrow: pickStr(raw.eyebrow, DEFAULT_KOBI_BANNER.eyebrow),
    bigTitle: pickStr(raw.bigTitle, DEFAULT_KOBI_BANNER.bigTitle),
    bigSubtitle: pickStr(raw.bigSubtitle, DEFAULT_KOBI_BANNER.bigSubtitle),
    tags: tags.length > 0 ? tags : DEFAULT_KOBI_BANNER.tags,
    rightEyebrow: pickStr(raw.rightEyebrow, DEFAULT_KOBI_BANNER.rightEyebrow),
    title: pickStr(raw.title, DEFAULT_KOBI_BANNER.title),
    description: pickStr(raw.description, DEFAULT_KOBI_BANNER.description),
    bullets: bullets.length > 0 ? bullets : DEFAULT_KOBI_BANNER.bullets,
    ctaLabel: pickStr(raw.ctaLabel, DEFAULT_KOBI_BANNER.ctaLabel),
    ctaHref: pickStr(raw.ctaHref, DEFAULT_KOBI_BANNER.ctaHref),
  }
}

function normalize(input: unknown): WebPackagesData {
  const obj = (input as Partial<WebPackagesData>) ?? {}
  const list = Array.isArray(obj.packages) ? obj.packages : []
  const packages: WebPackage[] = list
    .map((p) => {
      const raw = (p ?? {}) as Partial<WebPackage>
      const label = String(raw.label ?? "").trim()
      if (!label) return null
      const id =
        typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : slugify(label)
      const bullets = Array.isArray(raw.bullets)
        ? clamp(
            (raw.bullets as unknown[]).map((b) => String(b).trim()).filter(
              (b) => b.length > 0,
            ),
            MAX_WEB_PACKAGE_BULLETS,
          )
        : []
      return {
        id,
        label,
        tagline: String(raw.tagline ?? "").trim(),
        descriptor: String(raw.descriptor ?? "").trim(),
        desc: String(raw.desc ?? "").trim(),
        bullets,
        iconKey: isIconKey(raw.iconKey) ? raw.iconKey : "layers",
        kobiRedirect: Boolean(raw.kobiRedirect),
      }
    })
    .filter((p): p is WebPackage => p !== null)
  const kobiBanner = normalizeKobi(obj.kobiBanner)
  const wizardHeading = normalizeWizard(obj.wizardHeading)
  return packages.length > 0
    ? { packages, kobiBanner, wizardHeading }
    : { ...SEED, kobiBanner, wizardHeading }
}

function normalizeWizard(input: unknown): WizardHeading {
  const raw = (input ?? {}) as Partial<WizardHeading>
  const pickStr = (v: unknown): string =>
    typeof v === "string" ? v.trim() : ""
  return {
    titleLeader: pickStr(raw.titleLeader),
    titleHighlight: pickStr(raw.titleHighlight),
    subtitle: pickStr(raw.subtitle),
  }
}

export async function readWebPackages(): Promise<WebPackagesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return SEED
    throw err
  }
}

export async function writeWebPackages(data: WebPackagesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function updateKobiBanner(
  patch: Partial<KobiBanner>,
): Promise<void> {
  const current = await readWebPackages()
  const merged = normalizeKobi({ ...current.kobiBanner, ...patch })
  await writeWebPackages({ ...current, kobiBanner: merged })
}

export async function updateWizardHeading(
  patch: Partial<WizardHeading>,
): Promise<void> {
  const current = await readWebPackages()
  const merged = normalizeWizard({ ...current.wizardHeading, ...patch })
  await writeWebPackages({ ...current, wizardHeading: merged })
}

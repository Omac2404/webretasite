// File-based store for the dijital-reklamlar package data. Same JSON-
// on-disk pattern as the logos and reviews stores. Server-only.
//
// The shape is fixed: 3 channels × 3 packages = 9 packages. The admin
// edits text fields per package; channel keys, package keys, and the
// "growth = featured" rule are not editable. Missing fields fall back
// to the in-memory SEED so a partially-edited or deleted JSON file
// degrades gracefully instead of leaving a blank public page.

// Server-only: imports node:fs. Do not import from client components —
// pull the types from `./packages-types` instead.
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  CHANNEL_ORDER,
  MAX_AUDIENCE,
  MAX_ITEMS,
  PACKAGE_ORDER,
  type Channel,
  type ChannelKey,
  type PackageKey,
  type PackagesData,
  type Pkg,
} from "./packages-types"

export type { Channel, ChannelKey, PackageKey, PackagesData, Pkg }
export { CHANNEL_ORDER, MAX_AUDIENCE, MAX_ITEMS, PACKAGE_ORDER }

const DATA_FILE = path.join(process.cwd(), "data", "packages.json")

const SEED: PackagesData = {
  channels: [
    {
      key: "google",
      label: "Google Ads",
      short: "Google",
      intro:
        "Google Ads reklam yönetimi paketlerimiz ile bütçenize en uygun çözümü bulun.",
      packages: [
        {
          key: "basic",
          name: "Başlangıç Paketi",
          tagline: "Temel Google Ads reklam kurulumu ve yönetimi hizmeti.",
          price: "₺7.500",
          audience: [
            "Yeni reklam veren işletmeler",
            "Yerel hizmet firmaları",
            "Bütçesi sınırlı ama görünmek isteyenler",
          ],
          items: [
            "Google Ads hesap kurulumu",
            "1 arama (Search) kampanyası",
            "Anahtar kelime araştırması",
            "Aylık 1 raporlama toplantısı",
            "Temel dönüşüm takibi kurulumu",
          ],
        },
        {
          key: "growth",
          name: "Büyüme Paketi",
          tagline: "Segmentasyonlu Google Ads reklam yönetimi çözümü.",
          price: "₺12.500",
          audience: [
            "Düzenli müşteri akışı isteyen işletmeler",
            "Lead ve satış dengesini kurmak isteyen firmalar",
            "Reklamı profesyonel ve sistemli yönetmek isteyenler",
          ],
          items: [
            "Search + Display kampanya yönetimi",
            "Remarketing kurulumu",
            "Performance Max kampanyası",
            "A/B reklam metni testleri",
            "Aylık 2 raporlama toplantısı",
            "Gelişmiş dönüşüm takibi (GTM + GA4)",
          ],
        },
        {
          key: "premium",
          name: "Premium Paket",
          tagline: "Gelişmiş hedeflemeli Google Ads reklam yönetimi.",
          price: "₺20.000",
          audience: [
            "Rekabeti yüksek sektörler (hukuk, estetik, e-ticaret, yazılım vb.)",
            "Aylık 50.000 TL+ reklam bütçesi yöneten firmalar",
            "E-ticaret siteleri",
          ],
          items: [
            "Tüm kampanya tipleri (Search, Display, PMax, Shopping, YouTube)",
            "Google Merchant Center entegrasyonu",
            "Gelişmiş kitle segmentasyonu",
            "Haftalık optimizasyon",
            "Aylık 4 raporlama toplantısı",
            "Özel dashboard ve attribution modelleme",
          ],
        },
      ],
    },
    {
      key: "meta",
      label: "Meta Ads",
      short: "Meta",
      intro:
        "Meta Ads reklam yönetimi paketlerimiz ile Instagram ve Facebook'ta doğru kitleye ulaşın.",
      packages: [
        {
          key: "basic",
          name: "Başlangıç Paketi",
          tagline:
            "Meta Ads'e yeni başlayanlar için temel reklam kurulumu ve yönetimi.",
          price: "₺5.000",
          audience: [
            "Reklama yeni başlayacak markalar",
            "Butik işletmeler",
            "Yerel firmalar",
          ],
          items: [
            "Business Manager + Pixel kurulumu",
            "1 kampanya yönetimi",
            "Temel kitle hedefleme",
            "Aylık 1 raporlama toplantısı",
            "Reklam metni desteği",
          ],
        },
        {
          key: "growth",
          name: "Büyüme Paketi",
          tagline:
            "Satış ve lead odaklı, segmentasyonlu Meta reklam yönetimi.",
          price: "₺7.500",
          audience: [
            "Düzenli satış ve lead isteyen markalar",
            "Aylık 20.000 – 50.000 TL reklam bütçesi olan firmalar",
            "Sektöründe ilk sayfada görünmek isteyen markalar",
          ],
          items: [
            "Çoklu kampanya yönetimi (Instagram + Facebook)",
            "Remarketing ve lookalike kitleler",
            "A/B yaratıcı testleri",
            "Aylık 2 raporlama toplantısı",
            "Gelişmiş dönüşüm takibi (Conversions API)",
          ],
        },
        {
          key: "premium",
          name: "Premium Paket",
          tagline:
            "Gelişmiş hedefleme ve performans optimizasyonlu Meta Ads yönetimi.",
          price: "₺15.000",
          audience: [
            "E-ticaret",
            "Marka büyütmek isteyen firmalar",
            "Yüksek bütçeli kampanyalar",
          ],
          items: [
            "Tüm yerleşimler (Reels, Stories, Feed, Marketplace)",
            "Catalog Ads ve Advantage+ Shopping",
            "Gelişmiş kitle segmentasyonu ve dinamik retargeting",
            "Haftalık optimizasyon",
            "Aylık 4 raporlama toplantısı",
            "Özel dashboard ve attribution modelleme",
          ],
        },
      ],
    },
    {
      key: "360",
      label: "Google + Meta",
      short: "G + M",
      intro:
        "Google ve Meta'yı tek elden, koordineli bir stratejiyle yöneten paketlerimiz.",
      packages: [
        {
          key: "basic",
          name: "Başlangıç Paketi",
          tagline:
            "Google ve Meta'yı tek elden başlatın — temel 360° reklam yönetimi.",
          price: "₺10.000",
          audience: [
            "İki kanalda da görünür olmak isteyen işletmeler",
            "Reklama yeni başlayan markalar",
            "Yerel hizmet firmaları",
          ],
          items: [
            "Google Ads + Meta Ads hesap kurulumu",
            "1 kampanya / kanal",
            "Çapraz kanal raporlaması",
            "Aylık 1 raporlama toplantısı",
            "Birleşik dönüşüm takibi",
          ],
        },
        {
          key: "growth",
          name: "Büyüme Paketi",
          tagline:
            "Segmentasyonlu, çoklu kampanyalı entegre Google + Meta yönetimi.",
          price: "₺18.000",
          audience: [
            "Düzenli müşteri akışı isteyen işletmeler",
            "Aylık 30.000 – 80.000 TL reklam bütçesi olan firmalar",
            "Reklamı profesyonel yönetmek isteyenler",
          ],
          items: [
            "Google + Meta çoklu kampanya yönetimi",
            "Remarketing (her iki kanalda)",
            "A/B yaratıcı ve metin testleri",
            "Aylık 2 raporlama toplantısı",
            "Gelişmiş dönüşüm takibi (GA4 + CAPI)",
            "Kanallar arası bütçe optimizasyonu",
          ],
        },
        {
          key: "premium",
          name: "Premium Paket",
          tagline:
            "Tüm kanallar, gelişmiş segmentasyon ve haftalık optimizasyon ile 360° yönetim.",
          price: "₺30.000",
          audience: [
            "Yüksek rekabetli sektörler",
            "Aylık 100.000 TL+ reklam bütçesi yöneten markalar",
            "E-ticaret ve büyük lead odaklı firmalar",
          ],
          items: [
            "Google + Meta'da tüm kampanya tipleri",
            "Merchant Center + Catalog entegrasyonu",
            "Gelişmiş kitle segmentasyonu ve attribution",
            "Haftalık optimizasyon",
            "Aylık 4 raporlama toplantısı",
            "Özel dashboard ve stratejik danışmanlık",
          ],
        },
      ],
    },
  ],
}

function clamp<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(0, max) : arr
}

function seedChannel(key: ChannelKey): Channel {
  return SEED.channels.find((c) => c.key === key)!
}

function seedPackage(channelKey: ChannelKey, packageKey: PackageKey): Pkg {
  return seedChannel(channelKey).packages.find((p) => p.key === packageKey)!
}

// Merge incoming JSON with SEED defaults — keep order/keys canonical
// regardless of what's on disk.
function normalizeData(input: unknown): PackagesData {
  const obj = (input as Partial<PackagesData>) ?? {}
  const incoming = Array.isArray(obj.channels) ? obj.channels : []

  const channels: Channel[] = CHANNEL_ORDER.map((ck) => {
    const seed = seedChannel(ck)
    const found = incoming.find((c) => c?.key === ck) as
      | Partial<Channel>
      | undefined
    const incomingPkgs = Array.isArray(found?.packages) ? found!.packages : []
    const packages: Pkg[] = PACKAGE_ORDER.map((pk) => {
      const sp = seedPackage(ck, pk)
      const foundPkg = incomingPkgs.find((p) => (p as Pkg)?.key === pk) as
        | Partial<Pkg>
        | undefined
      const audience = Array.isArray(foundPkg?.audience)
        ? clamp(
            foundPkg!.audience.map((s) => String(s)).filter((s) => s.length > 0),
            MAX_AUDIENCE,
          )
        : sp.audience
      const items = Array.isArray(foundPkg?.items)
        ? clamp(
            foundPkg!.items.map((s) => String(s)).filter((s) => s.length > 0),
            MAX_ITEMS,
          )
        : sp.items
      return {
        key: pk,
        name: foundPkg?.name?.toString().trim() || sp.name,
        tagline: foundPkg?.tagline?.toString().trim() || sp.tagline,
        price: foundPkg?.price?.toString().trim() || sp.price,
        audience: audience.length > 0 ? audience : sp.audience,
        items: items.length > 0 ? items : sp.items,
      }
    })
    return {
      key: ck,
      label: found?.label?.toString().trim() || seed.label,
      short: found?.short?.toString().trim() || seed.short,
      intro: found?.intro?.toString().trim() || seed.intro,
      packages,
    }
  })

  return { channels }
}

export async function readPackages(): Promise<PackagesData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    return normalizeData(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return SEED
    throw err
  }
}

async function writePackages(data: PackagesData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8")
}

export async function updateChannel(
  channelKey: ChannelKey,
  fields: { label: string; short: string; intro: string },
): Promise<void> {
  const data = await readPackages()
  const channel = data.channels.find((c) => c.key === channelKey)
  if (!channel) return
  if (fields.label.trim()) channel.label = fields.label.trim()
  if (fields.short.trim()) channel.short = fields.short.trim()
  if (fields.intro.trim()) channel.intro = fields.intro.trim()
  await writePackages(data)
}

export async function updatePackage(
  channelKey: ChannelKey,
  packageKey: PackageKey,
  fields: {
    name: string
    tagline: string
    price: string
    audience: string[]
    items: string[]
  },
): Promise<void> {
  const data = await readPackages()
  const channel = data.channels.find((c) => c.key === channelKey)
  if (!channel) return
  const pkg = channel.packages.find((p) => p.key === packageKey)
  if (!pkg) return
  pkg.name = fields.name
  pkg.tagline = fields.tagline
  pkg.price = fields.price
  pkg.audience = clamp(
    fields.audience.map((s) => s.trim()).filter((s) => s.length > 0),
    MAX_AUDIENCE,
  )
  pkg.items = clamp(
    fields.items.map((s) => s.trim()).filter((s) => s.length > 0),
    MAX_ITEMS,
  )
  await writePackages(data)
}
